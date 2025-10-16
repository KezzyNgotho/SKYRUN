;; SavingsVault.clar - Handles DeFi savings deposits and yield accrual logic
;; Core module for CoinQuest gamified DeFi savings platform

(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-INSUFFICIENT-BALANCE (err u101))
(define-constant ERR-INVALID-AMOUNT (err u102))
(define-constant ERR-VAULT-LOCKED (err u103))
(define-constant ERR-YIELD-CALCULATION-FAILED (err u104))

;; Yield calculation constants
(define-constant BASE-YIELD-RATE u100) ;; 1% base yield (100 = 1%)
(define-constant YIELD-DENOMINATOR u10000) ;; For percentage calculations
(define-constant MINIMUM-DEPOSIT u1000000) ;; 1 STX minimum deposit
(define-constant LOCK-PERIOD u86400) ;; 24 hours lock period

;; Data Variables
(define-data-var total-deposits uint u0)
(define-data-var total-yield-distributed uint u0)
(define-data-var quest-manager-contract (optional principal) none)
(define-data-var reward-token-contract (optional principal) none)

;; User savings data
(define-map user-savings
  principal
  {
    total-deposited: uint,
    total-withdrawn: uint,
    current-balance: uint,
    last-deposit-time: uint,
    last-yield-claim: uint,
    yield-earned: uint,
    deposit-count: uint
  }
)

;; Deposit records
(define-map deposits
  (tuple (user principal) (deposit-id uint))
  {
    amount: uint,
    deposit-time: uint,
    lock-end-time: uint,
    withdrawn: bool,
    yield-earned: uint
  }
)

;; Yield rates (can be updated by admin)
(define-map yield-rates
  uint
  {
    rate: uint,
    start-time: uint,
    end-time: uint,
    active: bool
  }
)

;; Events removed for compatibility

;; Initialize yield rates
(define-public (initialize-yield-rates)
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-NOT-AUTHORIZED)
    
    ;; Set initial yield rate
    (map-set yield-rates u1 {
      rate: BASE-YIELD-RATE,
      start-time: block-height,
      end-time: (+ block-height u210240), ;; ~1 year in blocks (approx)
      active: true
    })
    
    (ok true)
  )
)

;; Make a savings deposit
(define-public (deposit (amount uint))
  (let (
    (user tx-sender)
    (user-data (default-to {
      total-deposited: u0,
      total-withdrawn: u0,
      current-balance: u0,
      last-deposit-time: u0,
      last-yield-claim: block-height,
      yield-earned: u0,
      deposit-count: u0
    } (map-get? user-savings user)))
  )
    (begin
      (asserts! (>= amount MINIMUM-DEPOSIT) ERR-INVALID-AMOUNT)
      
      (let (
        (deposit-id (+ (get deposit-count user-data) u1))
        (lock-end-time (+ block-height LOCK-PERIOD))
        (new-user-data {
          total-deposited: (+ (get total-deposited user-data) amount),
          total-withdrawn: (get total-withdrawn user-data),
          current-balance: (+ (get current-balance user-data) amount),
          last-deposit-time: block-height,
          last-yield-claim: (get last-yield-claim user-data),
          yield-earned: (get yield-earned user-data),
          deposit-count: deposit-id
        })
      )
        (begin
          ;; Update user savings data
          (map-set user-savings user new-user-data)
          
          ;; Create deposit record
          (map-set deposits (tuple (user user) (deposit-id deposit-id)) {
            amount: amount,
            deposit-time: block-height,
            lock-end-time: lock-end-time,
            withdrawn: false,
            yield-earned: u0
          })
          
          ;; Update total deposits
          (var-set total-deposits (+ (var-get total-deposits) amount))
          
          ;; Notify quest manager about deposit milestone
          (unwrap-panic (notify-quest-manager user amount))
          
          (ok true)
        )
      )
    )
  )
)

;; Withdraw from savings
(define-public (withdraw (deposit-id uint))
  (let (
    (user tx-sender)
    (deposit-record (unwrap-panic (map-get? deposits (tuple (user user) (deposit-id deposit-id)))))
    (user-data (unwrap-panic (map-get? user-savings user)))
  )
    (begin
      (asserts! (not (get withdrawn deposit-record)) ERR-VAULT-LOCKED)
      (asserts! (>= block-height (get lock-end-time deposit-record)) ERR-VAULT-LOCKED)
      
      (let (
        (withdrawal-amount (+ (get amount deposit-record) (get yield-earned deposit-record)))
        (new-user-data {
          total-deposited: (get total-deposited user-data),
          total-withdrawn: (+ (get total-withdrawn user-data) withdrawal-amount),
          current-balance: (- (get current-balance user-data) (get amount deposit-record)),
          last-deposit-time: (get last-deposit-time user-data),
          last-yield-claim: block-height,
          yield-earned: (- (get yield-earned user-data) (get yield-earned deposit-record)),
          deposit-count: (get deposit-count user-data)
        })
      )
        (begin
          ;; Update user savings data
          (map-set user-savings user new-user-data)
          
          ;; Mark deposit as withdrawn
          (map-set deposits (tuple (user user) (deposit-id deposit-id)) {
            amount: (get amount deposit-record),
            deposit-time: (get deposit-time deposit-record),
            lock-end-time: (get lock-end-time deposit-record),
            withdrawn: true,
            yield-earned: (get yield-earned deposit-record)
          })
          
          ;; Update total deposits
          (var-set total-deposits (- (var-get total-deposits) (get amount deposit-record)))
          
          (ok true)
        )
      )
    )
  )
)

;; Calculate and claim yield
(define-public (claim-yield)
  (let (
    (user tx-sender)
    (user-data (unwrap-panic (map-get? user-savings user)))
  )
    (begin
      (let (
        (yield-amount (calculate-yield user user-data))
      )
        (begin
          (asserts! (> yield-amount u0) ERR-YIELD-CALCULATION-FAILED)
          
          ;; Update user data
          (map-set user-savings user {
            total-deposited: (get total-deposited user-data),
            total-withdrawn: (get total-withdrawn user-data),
            current-balance: (get current-balance user-data),
            last-deposit-time: (get last-deposit-time user-data),
            last-yield-claim: block-height,
            yield-earned: (+ (get yield-earned user-data) yield-amount),
            deposit-count: (get deposit-count user-data)
          })
          
          ;; Update total yield distributed
          (var-set total-yield-distributed (+ (var-get total-yield-distributed) yield-amount))
          
          ;; Mint reward tokens
          (unwrap-panic (mint-reward-tokens user yield-amount))
          
          (ok true)
        )
      )
    )
  )
)

;; Internal yield calculation
(define-private (calculate-yield (user principal) (user-data {total-deposited: uint, total-withdrawn: uint, current-balance: uint, last-deposit-time: uint, last-yield-claim: uint, yield-earned: uint, deposit-count: uint}))
  (let (
    (current-balance (get current-balance user-data))
    (last-claim-time (get last-yield-claim user-data))
    (time-elapsed (- block-height last-claim-time))
    (yield-rate (get-current-yield-rate))
  )
    (begin
      (if (> current-balance u0)
        ;; Calculate yield: (balance * rate * time) / (denominator * seconds_per_day)
        (/ (* current-balance yield-rate time-elapsed) (* YIELD-DENOMINATOR u86400))
        u0
      )
    )
  )
)

;; Get current yield rate
(define-private (get-current-yield-rate)
  (let (
    (rate-id u1)
    (rate-info (unwrap-panic (map-get? yield-rates rate-id)))
  )
    (if (and (get active rate-info) 
             (>= block-height (get start-time rate-info))
             (<= block-height (get end-time rate-info)))
      (get rate rate-info)
      BASE-YIELD-RATE
    )
  )
)

;; Notify quest manager about savings milestone
(define-private (notify-quest-manager (user principal) (amount uint))
  ;; Stubbed out to avoid compile-time dependency on external contract name
  (ok true)
)

;; Mint reward tokens for yield
(define-private (mint-reward-tokens (user principal) (amount uint))
  ;; Stubbed out to avoid compile-time dependency on external contract name
  (ok true)
)

;; Read-only Functions

;; Get user savings balance
(define-read-only (get-balance (user principal))
  (let (
    (user-data (default-to {
      total-deposited: u0,
      total-withdrawn: u0,
      current-balance: u0,
      last-deposit-time: u0,
      last-yield-claim: u0,
      yield-earned: u0,
      deposit-count: u0
    } (map-get? user-savings user)))
  )
    (ok (get current-balance user-data))
  )
)

;; Get user savings data
(define-read-only (get-user-savings (user principal))
  (ok (map-get? user-savings user))
)

;; Get deposit record
(define-read-only (get-deposit (user principal) (deposit-id uint))
  (ok (map-get? deposits (tuple (user user) (deposit-id deposit-id))))
)

;; Calculate current yield for user
(define-read-only (calculate-current-yield (user principal))
  (let (
    (user-data (unwrap-panic (map-get? user-savings user)))
  )
    (ok (calculate-yield user user-data))
  )
)

;; Get total deposits
(define-read-only (get-total-deposits)
  (ok (var-get total-deposits))
)

;; Get total yield distributed
(define-read-only (get-total-yield-distributed)
  (ok (var-get total-yield-distributed))
)

;; Get current yield rate
(define-read-only (get-current-yield-rate-public)
  (ok (get-current-yield-rate))
)

;; Admin Functions

;; Set quest manager contract
(define-public (set-quest-manager-contract (contract principal))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-NOT-AUTHORIZED)
    (var-set quest-manager-contract (some contract))
    (ok true)
  )
)

;; Set reward token contract
(define-public (set-reward-token-contract (contract principal))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-NOT-AUTHORIZED)
    (var-set reward-token-contract (some contract))
    (ok true)
  )
)

;; Update yield rate
(define-public (update-yield-rate (rate uint) (duration uint))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-NOT-AUTHORIZED)
    (asserts! (> rate u0) ERR-INVALID-AMOUNT)
    
    (let (
      (new-rate-id (+ (get-current-rate-id) u1))
      (start-time block-height)
      (end-time (+ start-time duration))
    )
      (begin
        ;; Deactivate current rate
        (map-set yield-rates (get-current-rate-id) {
          rate: (get-current-yield-rate),
          start-time: u0,
          end-time: u0,
          active: false
        })
        
        ;; Set new rate
        (map-set yield-rates new-rate-id {
          rate: rate,
          start-time: start-time,
          end-time: end-time,
          active: true
        })
        
        (ok true)
      )
    )
  )
)

;; Get current rate ID
(define-private (get-current-rate-id)
  u1
)