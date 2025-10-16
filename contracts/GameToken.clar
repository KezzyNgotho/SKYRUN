;; GameToken.clar - ERC20-like token for in-game rewards
;; Simplified token contract for CoinQuest game

(define-constant CONTRACT-OWNER tx-sender)
(define-constant TOKEN-SYMBOL "COINQ")
(define-constant TOKEN-NAME "CoinQuest Game Token")
(define-constant DECIMALS u6)
(define-constant INITIAL-SUPPLY u1000000000000) ;; 1M tokens with 6 decimals

(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-INSUFFICIENT-BALANCE (err u101))
(define-constant ERR-INSUFFICIENT-ALLOWANCE (err u102))
(define-constant ERR-INVALID-RECIPIENT (err u103))

;; Data Variables
(define-data-var total-supply uint INITIAL-SUPPLY)
(define-data-var quest-rewards-contract (optional principal) none)

;; Token balances
(define-map balances principal uint)

;; Allowances
(define-map allowances
  (tuple (owner principal) (spender principal))
  uint
)

;; Events removed for compatibility

;; Public Functions

;; Transfer tokens
(define-public (transfer (amount uint) (recipient principal))
  (let (
    (sender-balance (default-to u0 (map-get? balances tx-sender)))
    (recipient-balance (default-to u0 (map-get? balances recipient)))
  )
    (begin
      (asserts! (>= sender-balance amount) ERR-INSUFFICIENT-BALANCE)
      
      (map-set balances tx-sender (- sender-balance amount))
      (map-set balances recipient (+ recipient-balance amount))
      
      (ok true)
    )
  )
)

;; Transfer from (for allowances)
(define-public (transfer-from (sender principal) (recipient principal) (amount uint))
  (let (
    (allowance-key (tuple (owner sender) (spender tx-sender)))
    (current-allowance (default-to u0 (map-get? allowances allowance-key)))
    (sender-balance (default-to u0 (map-get? balances sender)))
    (recipient-balance (default-to u0 (map-get? balances recipient)))
  )
    (begin
      (asserts! (>= current-allowance amount) ERR-INSUFFICIENT-ALLOWANCE)
      (asserts! (>= sender-balance amount) ERR-INSUFFICIENT-BALANCE)
      
      (map-set balances sender (- sender-balance amount))
      (map-set balances recipient (+ recipient-balance amount))
      (map-set allowances allowance-key (- current-allowance amount))
      
      (ok true)
    )
  )
)

;; Approve spending
(define-public (approve (spender principal) (amount uint))
  (let (
    (allowance-key (tuple (owner tx-sender) (spender spender)))
  )
    (begin
      (map-set allowances allowance-key amount)
      (ok true)
    )
  )
)

;; Mint tokens (admin only)
(define-public (mint (recipient principal) (amount uint))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-NOT-AUTHORIZED)
    (asserts! (> amount u0) ERR-INVALID-RECIPIENT)
    
    (let (
      (current-balance (default-to u0 (map-get? balances recipient)))
      (new-balance (+ current-balance amount))
      (current-supply (var-get total-supply))
      (new-supply (+ current-supply amount))
    )
      (begin
        (map-set balances recipient new-balance)
        (var-set total-supply new-supply)
        (ok true)
      )
    )
  )
)

;; Read-only Functions

;; Get token info
(define-read-only (get-token-info)
  (ok {
    name: TOKEN-NAME,
    symbol: TOKEN-SYMBOL,
    decimals: DECIMALS,
    total-supply: (var-get total-supply)
  })
)

;; Get balance
(define-read-only (get-balance (owner principal))
  (ok (default-to u0 (map-get? balances owner)))
)

;; Get allowance
(define-read-only (get-allowance (owner principal) (spender principal))
  (let (
    (allowance-key (tuple (owner owner) (spender spender)))
  )
    (ok (default-to u0 (map-get? allowances allowance-key)))
  )
)

;; Admin Functions

;; Set quest rewards contract (only owner)
(define-public (set-quest-rewards-contract (contract principal))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-NOT-AUTHORIZED)
    (var-set quest-rewards-contract (some contract))
    (ok true)
  )
)