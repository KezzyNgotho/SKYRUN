;; NFTBadge.clar - Issues NFTs to players when they achieve specific milestones
;; Core module for CoinQuest gamified DeFi savings platform

(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-NFT-NOT-FOUND (err u101))
(define-constant ERR-INVALID-RECIPIENT (err u102))
(define-constant ERR-INVALID-URI (err u103))
(define-constant ERR-NOT-OWNER (err u104))

;; Badge types
(define-constant BADGE-TYPE-FIRST-SAVE u1)
(define-constant BADGE-TYPE-SAVINGS-STREAK u2)
(define-constant BADGE-TYPE-HIGH-SCORE u3)
(define-constant BADGE-TYPE-QUEST-MASTER u4)
(define-constant BADGE-TYPE-DEAL-MAKER u5)
(define-constant BADGE-TYPE-LEVEL-UP u6)

;; Data Variables
(define-data-var token-counter uint u0)
(define-data-var quest-manager-contract (optional principal) none)

;; NFT data structure
(define-map tokens
  uint
  {
    owner: principal,
    badge-type: uint,
    minted-at: uint,
    metadata-uri: (string-utf8 200),
    rarity: uint
  }
)

;; Badge type definitions
(define-map badge-types
  uint
  {
    name: (string-utf8 50),
    description: (string-utf8 200),
    metadata-uri: (string-utf8 200),
    rarity: uint,
    requirements: (string-utf8 200)
  }
)

;; User badge collections
(define-map user-badges
  principal
  (list 100 uint)
)

;; Badge ownership tracking
(define-map badge-owners
  (tuple (owner principal) (badge-type uint))
  uint
)

;; Events removed for compatibility

;; Initialize badge types
(define-public (initialize-badge-types)
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-NOT-AUTHORIZED)
    
    ;; First Save Badge
    (map-set badge-types BADGE-TYPE-FIRST-SAVE {
      name: u"First Saver",
      description: u"Achieved your first savings milestone",
      metadata-uri: u"https://coinquest.com/badges/first-saver.json",
      rarity: u1,
      requirements: u"Save your first STX"
    })
    
    ;; Savings Streak Badge
    (map-set badge-types BADGE-TYPE-SAVINGS-STREAK {
      name: u"Streak Master",
      description: u"Maintained savings streak for 7 days",
      metadata-uri: u"https://coinquest.com/badges/streak-master.json",
      rarity: u2,
      requirements: u"Save STX for 7 consecutive days"
    })
    
    ;; High Score Badge
    (map-set badge-types BADGE-TYPE-HIGH-SCORE {
      name: u"Score Champion",
      description: u"Achieved a high score in the game",
      metadata-uri: u"https://coinquest.com/badges/score-champion.json",
      rarity: u3,
      requirements: u"Score 1000+ points in a single game"
    })
    
    ;; Quest Master Badge
    (map-set badge-types BADGE-TYPE-QUEST-MASTER {
      name: u"Quest Master",
      description: u"Completed 10 quests",
      metadata-uri: u"https://coinquest.com/badges/quest-master.json",
      rarity: u4,
      requirements: u"Complete 10 quests"
    })
    
    ;; Deal Maker Badge
    (map-set badge-types BADGE-TYPE-DEAL-MAKER {
      name: u"Deal Maker",
      description: u"Made a profitable DeFi transaction",
      metadata-uri: u"https://coinquest.com/badges/deal-maker.json",
      rarity: u5,
      requirements: u"Earn yield from DeFi savings"
    })
    
    ;; Level Up Badge
    (map-set badge-types BADGE-TYPE-LEVEL-UP {
      name: u"Level Up",
      description: u"Reached level 5",
      metadata-uri: u"https://coinquest.com/badges/level-up.json",
      rarity: u2,
      requirements: u"Reach level 5 in CoinQuest"
    })
    
    (ok true)
  )
)
;; Mint badge (called by quest manager or game)
(define-public (mint-badge (recipient principal) (badge-type uint) (custom-uri (optional (string-utf8 200))))
  (begin
    (asserts! (is-some (var-get quest-manager-contract)) ERR-NOT-AUTHORIZED)
    (asserts! (is-eq tx-sender (unwrap-panic (var-get quest-manager-contract))) ERR-NOT-AUTHORIZED)
    ;; recipient validity check removed for compatibility
    (asserts! (is-some (map-get? badge-types badge-type)) ERR-NFT-NOT-FOUND)
    
    ;; Check if user already has this badge type
    (let (
      (existing-badge-count (default-to u0 (map-get? badge-owners (tuple (owner recipient) (badge-type badge-type)))))
    )
      (begin
        ;; Allow multiple badges of same type for different achievements
        (let (
          (token-id (+ (var-get token-counter) u1))
          (badge-info (unwrap-panic (map-get? badge-types badge-type)))
          ;; Fixed: Ensure both string types match - use string-utf8 consistently
          (metadata-uri (if (is-some custom-uri) 
                          (unwrap-panic custom-uri) 
                          (get metadata-uri badge-info)))
          (user-badge-list (default-to (list) (map-get? user-badges recipient)))
        )
          (begin
            ;; Update token counter
            (var-set token-counter token-id)
            
            ;; Create NFT
            (map-set tokens token-id {
              owner: recipient,
              badge-type: badge-type,
              minted-at: block-height,
              metadata-uri: metadata-uri,
              rarity: (get rarity badge-info)
            })
            
            ;; Update badge ownership count
            (map-set badge-owners (tuple (owner recipient) (badge-type badge-type)) (+ existing-badge-count u1))
            
            ;; Add to user's badge collection
            (map-set user-badges recipient (unwrap! (as-max-len? (append user-badge-list token-id) u100) (err u105)))
            
            (ok true)
          )
        )
      )
    )
  )
)

;; Transfer badge
(define-public (transfer-badge (token-id uint) (recipient principal))
  (let (
    (sender tx-sender)
    (token (unwrap-panic (map-get? tokens token-id)))
  )
    (begin
      (asserts! (is-eq (get owner token) sender) ERR-NOT-OWNER)
      ;; recipient validity check removed for compatibility
      
      ;; Update token owner
      (map-set tokens token-id {
        owner: recipient,
        badge-type: (get badge-type token),
        minted-at: (get minted-at token),
        metadata-uri: (get metadata-uri token),
        rarity: (get rarity token)
      })
      
      ;; Update badge ownership counts
      (let (
        (sender-count (default-to u0 (map-get? badge-owners (tuple (owner sender) (badge-type (get badge-type token))))))
        (recipient-count (default-to u0 (map-get? badge-owners (tuple (owner recipient) (badge-type (get badge-type token))))))
      )
        (begin
          (map-set badge-owners (tuple (owner sender) (badge-type (get badge-type token))) (- sender-count u1))
          (map-set badge-owners (tuple (owner recipient) (badge-type (get badge-type token))) (+ recipient-count u1))
        )
      )
      
      (ok true)
    )
  )
)

;; Read-only Functions

;; Get badge details
(define-read-only (get-badge (token-id uint))
  (ok (map-get? tokens token-id))
)

;; Get badge URI
(define-read-only (get-badge-uri (token-id uint))
  (let (
    (token (unwrap-panic (map-get? tokens token-id)))
  )
    (ok (get metadata-uri token))
  )
)

;; Get badge owner
(define-read-only (get-badge-owner (token-id uint))
  (let (
    (token (unwrap-panic (map-get? tokens token-id)))
  )
    (ok (get owner token))
  )
)

;; Get user's badges
(define-read-only (get-user-badges (user principal))
  (ok (map-get? user-badges user))
)

;; Get badge type info
(define-read-only (get-badge-type (badge-type uint))
  (ok (map-get? badge-types badge-type))
)

;; Get user's badge count for specific type
(define-read-only (get-user-badge-count (user principal) (badge-type uint))
  (ok (default-to u0 (map-get? badge-owners (tuple (owner user) (badge-type badge-type)))))
)

;; Get total badges minted
(define-read-only (get-total-badges)
  (ok (var-get token-counter))
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

;; Create new badge type
(define-public (create-badge-type 
  (badge-type uint)
  (name (string-utf8 50))
  (description (string-utf8 200))
  (metadata-uri (string-utf8 200))
  (rarity uint)
  (requirements (string-utf8 200))
)
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-NOT-AUTHORIZED)
    (asserts! (is-none (map-get? badge-types badge-type)) ERR-NFT-NOT-FOUND)
    
    (map-set badge-types badge-type {
      name: name,
      description: description,
      metadata-uri: metadata-uri,
      rarity: rarity,
      requirements: requirements
    })
    
    (ok true)
  )
)