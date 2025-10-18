;; CoinQuestToken.clar - Unified token contract for CoinQuest game
(define-constant CONTRACT_OWNER tx-sender)
(define-constant TOKEN_SYMBOL "COINQ")
(define-constant TOKEN_NAME "CoinQuest Token")
(define-constant DECIMALS u6)
(define-constant INITIAL_SUPPLY u1000000000000) ;; 1M tokens with 6 decimals

(define-constant ERR_NOT_AUTHORIZED (err u100))
(define-constant ERR_INSUFFICIENT_BALANCE (err u101))
(define-constant ERR_INSUFFICIENT_ALLOWANCE (err u102))
(define-constant ERR_INVALID_RECIPIENT (err u103))

;; Data Variables
(define-data-var total_supply uint INITIAL_SUPPLY)
(define-data-var game_contract (optional principal) none)

;; Token balances
(define-map balances principal uint)

;; Allowances
(define-map allowances
  (tuple (owner principal) (spender principal))
  uint
)

;; Public Functions

;; Transfer tokens
(define-public (transfer (amount uint) (recipient principal))
  (begin
    (asserts! (is-ok (transfer_internal tx-sender recipient amount)) ERR_INSUFFICIENT_BALANCE)
    (ok true)
  )
)

;; Transfer from (for allowances)
(define-public (transfer_from (sender principal) (recipient principal) (amount uint))
  (let (
    (allowance_key (tuple (owner sender) (spender tx-sender)))
    (current_allowance (default-to u0 (map-get? allowances allowance_key)))
  )
    (begin
      (asserts! (>= current_allowance amount) ERR_INSUFFICIENT_ALLOWANCE)
      (asserts! (is-ok (transfer_internal sender recipient amount)) ERR_INSUFFICIENT_BALANCE)
      
      ;; Update allowance
      (map-set allowances allowance_key (- current_allowance amount))
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

;; Mint tokens (only by game contract)
(define-public (mint (recipient principal) (amount uint))
  (begin
    (asserts! (is-some (var-get game_contract)) ERR_NOT_AUTHORIZED)
    (asserts! (is-eq tx-sender (unwrap-panic (var-get game_contract))) ERR_NOT_AUTHORIZED)
    (asserts! (> amount u0) ERR_INVALID_RECIPIENT)
    
    (let (
      (current_supply (var-get total_supply))
      (new_supply (+ current_supply amount))
    )
      (begin
        ;; Update total supply
        (var-set total_supply new_supply)
        
        ;; Update recipient balance
        (map-set balances recipient (+ (default-to u0 (map-get? balances recipient)) amount))
        
        (ok true)
      )
    )
  )
)

;; Internal transfer function
(define-private (transfer_internal (sender principal) (recipient principal) (amount uint))
  (let (
    (sender_balance (default-to u0 (map-get? balances sender)))
  )
    (begin
      (asserts! (>= sender_balance amount) ERR_INSUFFICIENT_BALANCE)
      
      ;; Update balances
      (map-set balances sender (- sender_balance amount))
      (map-set balances recipient (+ (default-to u0 (map-get? balances recipient)) amount))
      
      (ok true)
    )
  )
)

;; Read-only Functions

;; Get balance
(define-read-only (get_balance (owner principal))
  (ok (default-to u0 (map-get? balances owner)))
)

;; Get allowance
(define-read-only (get_allowance (owner principal) (spender principal))
  (ok (default-to u0 (map-get? allowances (tuple (owner owner) (spender spender)))))
)

;; Get total supply
(define-read-only (get_total_supply)
  (ok (var-get total_supply))
)

;; Get token info
(define-read-only (get_token_info)
  (ok {
    name: TOKEN_NAME,
    symbol: TOKEN_SYMBOL,
    decimals: DECIMALS,
    total_supply: (var-get total_supply)
  })
)

;; Admin Functions

;; Set game contract (only owner)
(define-public (set_game_contract (contract principal))
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_NOT_AUTHORIZED)
    (var-set game_contract (some contract))
    (ok true)
  )
)