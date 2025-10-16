;; coinQuest Contract Trait
;; Defines the interface for the coinQuest gaming contract

(define-trait coin-quest-trait
  (
    ;; Game functions
    (start-game () (response bool uint))
    (finalize-game-score (uint) (response bool uint))
    (claim-rewards () (response bool uint))
    
    ;; Read-only functions
    (get-balance (principal) (response uint uint))
    (get-level (principal) (response uint uint))
    (get-total-earned (principal) (response uint uint))
    (get-games-played (principal) (response uint uint))
    (get-high-score (principal) (response uint uint))
    (get-total-supply () (response uint uint))
    
    ;; Admin functions
    (set-game-active (bool) (response bool uint))
    (set-reward-rate (uint) (response bool uint))
    (emergency-withdraw (uint) (response bool uint))
  )
)
