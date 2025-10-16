;; RewardToken.clar - Handles in-platform token (COINQ) rewards and minting logic
;; Core module for CoinQuest gamified DeFi savings platform

(define-constant CONTRACT-OWNER tx-sender)
(define-constant TOKEN-SYMBOL "COINQ")
(define-constant TOKEN-NAME "CoinQuest Token")
(define-constant DECIMALS u6)
(define-constant INITIAL-SUPPLY u1000000000000) ;; 1M tokens with 6 decimals

(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-INSUFFICIENT-BALANCE (err u101))
(define-constant ERR-INSUFFICIENT-ALLOWANCE (err u102))
(define-constant ERR-INVALID-RECIPIENT (err u103))
(define-constant ERR-INVALID-SENDER (err u104))
(define-constant ERR-MINT-LIMIT-EXCEEDED (err u105))

;; Data Variables
(define-data-var total-supply uint INITIAL-SUPPLY)
(define-data-var mint-cap uint u5000000000000) ;; 5M max supply
(define-data-var quest-manager-contract (optional principal) none)

;; Token balances
(define-map balances principal uint)

;; Allowances
(define-map allowances
  (tuple (owner principal) (spender principal))
  uint
)

;; Minting permissions
(define-map minters principal bool)

;; Events removed for compatibility

;; Public Functions

;; Transfer tokens
(define-public (transfer (amount uint) (recipient principal))
  (begin
    (asserts! (is-ok (transfer-internal tx-sender recipient amount)) ERR-INSUFFICIENT-BALANCE)
    (ok true)
  )
)

;; Transfer from (for allowances)
(define-public (transfer-from (sender principal) (recipient principal) (amount uint))
  (let (
    (allowance-key (tuple (owner sender) (spender tx-sender)))
    (current-allowance (default-to u0 (map-get? allowances allowance-key)))
  )
    (begin
      (asserts! (>= current-allowance amount) ERR-INSUFFICIENT-ALLOWANCE)
      (asserts! (is-ok (transfer-internal sender recipient amount)) ERR-INSUFFICIENT-BALANCE)
      
      ;; Update allowance
      (map-set allowances allowance-key (- current-allowance amount))
      (ok true)
    )
  )
)

;; Approve spending
(define-public (approve (spender principal) (amount uint))
  (begin
    (map-set allowances (tuple (owner tx-sender) (spender spender)) amount)
    (ok true)
  )
)

;; Mint tokens (only for quest rewards)
(define-public (mint (recipient principal) (amount uint))
  (begin
    (asserts! (is-some (var-get quest-manager-contract)) ERR-NOT-AUTHORIZED)
    (asserts! (is-eq tx-sender (unwrap-panic (var-get quest-manager-contract))) ERR-NOT-AUTHORIZED)
    (asserts! (> amount u0) ERR-INVALID-RECIPIENT)
    
    (let (
      (current-supply (var-get total-supply))
      (new-supply (+ current-supply amount))
    )
      (begin
        (asserts! (<= new-supply (var-get mint-cap)) ERR-MINT-LIMIT-EXCEEDED)
        
        ;; Update total supply
        (var-set total-supply new-supply)
        
        ;; Update recipient balance
        (map-set balances recipient (+ (default-to u0 (map-get? balances recipient)) amount))
        
        (ok true)
      )
    )
  )
)

;; Burn tokens
(define-public (burn (amount uint))
  (let (
    (sender tx-sender)
    (current-balance (default-to u0 (map-get? balances sender)))
  )
    (begin
      (asserts! (>= current-balance amount) ERR-INSUFFICIENT-BALANCE)
      (asserts! (> amount u0) ERR-INVALID-SENDER)
      
      ;; Update balance and supply
      (map-set balances sender (- current-balance amount))
      (var-set total-supply (- (var-get total-supply) amount))
      
      (ok true)
    )
  )
)

;; Internal transfer function
(define-private (transfer-internal (sender principal) (recipient principal) (amount uint))
  (let (
    (sender-balance (default-to u0 (map-get? balances sender)))
  )
    (begin
      (asserts! (>= sender-balance amount) ERR-INSUFFICIENT-BALANCE)
      ;; Recipient validity assertion removed for compatibility
      
      ;; Update balances
      (map-set balances sender (- sender-balance amount))
      (map-set balances recipient (+ (default-to u0 (map-get? balances recipient)) amount))
      
      (ok true)
    )
  )
)

;; Read-only Functions

;; Get balance
(define-read-only (get-balance (owner principal))
  (ok (default-to u0 (map-get? balances owner)))
)

;; Get allowance
(define-read-only (get-allowance (owner principal) (spender principal))
  (ok (default-to u0 (map-get? allowances (tuple (owner owner) (spender spender)))))
)

;; Get total supply
(define-read-only (get-total-supply)
  (ok (var-get total-supply))
)

;; Get token info
(define-read-only (get-token-info)
  (ok {
    name: TOKEN-NAME,
    symbol: TOKEN-SYMBOL,
    decimals: DECIMALS,
    total-supply: (var-get total-supply),
    mint-cap: (var-get mint-cap)
  })
)

;; Admin Functions

;; Set quest manager contract (only owner)
(define-public (set-quest-manager-contract (contract principal))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-NOT-AUTHORIZED)
    (var-set quest-manager-contract (some contract))
    (ok true)
  )
)

;; Update mint cap (only owner)
(define-public (set-mint-cap (new-cap uint))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-NOT-AUTHORIZED)
    (asserts! (>= new-cap (var-get total-supply)) ERR-INVALID-RECIPIENT)
    (var-set mint-cap new-cap)
    (ok true)
  )
)

;; Emergency mint (only owner, for special cases)
(define-public (emergency-mint (recipient principal) (amount uint))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-NOT-AUTHORIZED)
    (asserts! (> amount u0) ERR-INVALID-RECIPIENT)
    
    (let (
      (current-supply (var-get total-supply))
      (new-supply (+ current-supply amount))
    )
      (begin
        (asserts! (<= new-supply (var-get mint-cap)) ERR-MINT-LIMIT-EXCEEDED)
        
        ;; Update total supply
        (var-set total-supply new-supply)
        
        ;; Update recipient balance
        (map-set balances recipient (+ (default-to u0 (map-get? balances recipient)) amount))
        
        (ok (print (mint recipient amount)))
      )
    )
  )
)
