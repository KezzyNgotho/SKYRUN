;; QuestManager.clar - Manages all user quests, milestones, and progress
;; Core module for CoinQuest gamified DeFi savings platform

(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-QUEST-NOT-FOUND (err u101))
(define-constant ERR-QUEST-ALREADY-COMPLETED (err u102))
(define-constant ERR-INVALID-REWARD (err u103))
(define-constant ERR-INSUFFICIENT-BALANCE (err u104))

;; Quest status enumeration
(define-constant QUEST-STATUS-ACTIVE u1)
(define-constant QUEST-STATUS-COMPLETED u2)
(define-constant QUEST-STATUS-EXPIRED u3)

;; Quest types
(define-constant QUEST-TYPE-SAVINGS u1)
(define-constant QUEST-TYPE-GAME-SCORE u2)
(define-constant QUEST-TYPE-DAILY-LOGIN u3)
(define-constant QUEST-TYPE-SPECIAL u4)

;; Data Variables
(define-data-var quest-counter uint u0)
(define-data-var total-rewards-distributed uint u0)

;; Quest data structure
(define-map quests
  uint
  {
    title: (string-utf8 100),
    description: (string-utf8 500),
    quest-type: uint,
    reward-amount: uint,
    target-value: uint,
    deadline: uint,
    status: uint,
    creator: principal
  }
)

;; User quest progress
(define-map user-quest-progress
  (tuple (user principal) (quest-id uint))
  {
    progress: uint,
    completed: bool,
    claimed: bool,
    completion-time: (optional uint)
  }
)

;; User statistics
(define-map user-stats
  principal
  {
    total-quests-completed: uint,
    total-rewards-earned: uint,
    current-level: uint,
    join-date: uint
  }
)

;; Events removed for compatibility

;; Public Functions

;; Create a new quest
(define-public (create-quest 
  (title (string-utf8 100))
  (description (string-utf8 500))
  (quest-type uint)
  (reward-amount uint)
  (target-value uint)
  (deadline uint)
)
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-NOT-AUTHORIZED)
    (asserts! (> reward-amount u0) ERR-INVALID-REWARD)
    (asserts! (> target-value u0) ERR-INVALID-REWARD)
    (asserts! (> deadline block-height) ERR-INVALID-REWARD)
    
    (let (
      (quest-id (+ (var-get quest-counter) u1))
    )
      (begin
        (var-set quest-counter quest-id)
        
        (map-set quests quest-id {
          title: title,
          description: description,
          quest-type: quest-type,
          reward-amount: reward-amount,
          target-value: target-value,
          deadline: deadline,
          status: QUEST-STATUS-ACTIVE,
          creator: tx-sender
        })
        
        (ok true)
      )
    )
  )
)

;; Complete a quest (called by game or savings contract)
(define-public (complete-quest (quest-id uint) (user principal) (progress-value uint))
  (begin
    (asserts! (is-some (map-get? quests quest-id)) ERR-QUEST-NOT-FOUND)
    
    (let (
      (quest (unwrap-panic (map-get? quests quest-id)))
      (current-progress (default-to {
        progress: u0,
        completed: false,
        claimed: false,
        completion-time: none
      } (map-get? user-quest-progress (tuple (user user) (quest-id quest-id)))))
    )
      (begin
        (asserts! (not (get completed current-progress)) ERR-QUEST-ALREADY-COMPLETED)
        (asserts! (is-eq (get status quest) QUEST-STATUS-ACTIVE) ERR-QUEST-NOT-FOUND)
        (asserts! (<= block-height (get deadline quest)) ERR-QUEST-NOT-FOUND)
        
        ;; Check if quest target is met
        (if (>= progress-value (get target-value quest))
          ;; Quest completed
          (let (
            (new-progress {
              progress: progress-value,
              completed: true,
              claimed: false,
              completion-time: (some block-height)
            })
            (user-stat (default-to {
              total-quests-completed: u0,
              total-rewards-earned: u0,
              current-level: u1,
              join-date: block-height
            } (map-get? user-stats user)))
            (new-user-stat {
              total-quests-completed: (+ (get total-quests-completed user-stat) u1),
              total-rewards-earned: (+ (get total-rewards-earned user-stat) (get reward-amount quest)),
              current-level: (get current-level user-stat),
              join-date: (get join-date user-stat)
            })
          )
            (begin
              (map-set user-quest-progress (tuple (user user) (quest-id quest-id)) new-progress)
              (map-set user-stats user new-user-stat)
              
              ;; Check for level up (every 5 quests)
              (if (is-eq (mod (+ (get total-quests-completed user-stat) u1) u5) u0)
                (let ((new-level (+ (get current-level user-stat) u1)))
                  (map-set user-stats user {
                    total-quests-completed: (get total-quests-completed new-user-stat),
                    total-rewards-earned: (get total-rewards-earned new-user-stat),
                    current-level: new-level,
                    join-date: (get join-date user-stat)
                  })
                )
                true
              )
              (ok true)
            )
          )
          ;; Quest not completed yet
          (let (
            (new-progress {
              progress: progress-value,
              completed: false,
              claimed: false,
              completion-time: none
            })
          )
            (begin
              (map-set user-quest-progress (tuple (user user) (quest-id quest-id)) new-progress)
              (ok true)
            )
          )
        )
      )
    )
  )
)

;; Claim quest reward
(define-public (claim-reward (quest-id uint))
  (let (
    (user tx-sender)
    (quest (unwrap-panic (map-get? quests quest-id)))
    (progress (unwrap-panic (map-get? user-quest-progress (tuple (user user) (quest-id quest-id)))))
  )
    (begin
      (asserts! (get completed progress) ERR-QUEST-NOT-FOUND)
      (asserts! (not (get claimed progress)) ERR-QUEST-ALREADY-COMPLETED)
      
      ;; Mark as claimed
      (map-set user-quest-progress (tuple (user user) (quest-id quest-id)) {
        progress: (get progress progress),
        completed: true,
        claimed: true,
        completion-time: (get completion-time progress)
      })
      
      ;; Update total rewards distributed
      (var-set total-rewards-distributed (+ (var-get total-rewards-distributed) (get reward-amount quest)))
      
      (ok true)
    )
  )
)

;; Read-only Functions

;; Get quest details
(define-read-only (get-quest (quest-id uint))
  (ok (map-get? quests quest-id))
)

;; Get user quest progress
(define-read-only (get-quest-status (quest-id uint) (user principal))
  (ok (map-get? user-quest-progress (tuple (user user) (quest-id quest-id))))
)

;; Get user statistics
(define-read-only (get-user-stats (user principal))
  (ok (map-get? user-stats user))
)

;; Get total quests created
(define-read-only (get-total-quests)
  (ok (var-get quest-counter))
)

;; Get total rewards distributed
(define-read-only (get-total-rewards-distributed)
  (ok (var-get total-rewards-distributed))
)

;; Admin Functions

;; Update quest status
(define-public (update-quest-status (quest-id uint) (new-status uint))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-NOT-AUTHORIZED)
    (asserts! (is-some (map-get? quests quest-id)) ERR-QUEST-NOT-FOUND)
    
    (let (
      (quest (unwrap-panic (map-get? quests quest-id)))
    )
      (map-set quests quest-id {
        title: (get title quest),
        description: (get description quest),
        quest-type: (get quest-type quest),
        reward-amount: (get reward-amount quest),
        target-value: (get target-value quest),
        deadline: (get deadline quest),
        status: new-status,
        creator: (get creator quest)
      })
    )
    (ok true)
  )
)