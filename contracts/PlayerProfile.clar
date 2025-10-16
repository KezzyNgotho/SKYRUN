;; PlayerProfile.clar - tracks user progress and stats
;; Optional contract for enhanced player tracking

(define-data-var contract-owner principal tx-sender)
(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-PROFILE-NOT-FOUND (err u101))

;; Data Variables
(define-data-var quest-rewards-contract (optional principal) none)

;; Player profile data
(define-map player-profiles
  principal
  {
    username: (string-utf8 50),
    join-date: uint,
    total-play-time: uint,
    favorite-game-mode: (string-utf8 20),
    achievements: (list 20 uint),
    social-links: (string-utf8 200),
    bio: (string-utf8 300)
  }
)

;; Player achievements
(define-map achievements
  uint
  {
    name: (string-utf8 50),
    description: (string-utf8 200),
    icon-url: (string-utf8 200),
    rarity: uint
  }
)

;; Player leaderboard
(define-map leaderboard
  uint
  {
    player: principal,
    score: uint,
    level: uint,
    rank: uint
  }
)

;; Events removed for compatibility

;; ------------------------------------
;; Read-only Functions
;; ------------------------------------

(define-read-only (get-profile (user principal))
  (ok (map-get? player-profiles user))
)

(define-read-only (get-username (user principal))
  (let ((profile (unwrap-panic (map-get? player-profiles user))))
    (ok (get username profile))
  )
)

(define-read-only (get-player-stats (user principal))
  (let ((profile (unwrap-panic (map-get? player-profiles user))))
    (ok {
      username: (get username profile),
      join-date: (get join-date profile),
      total-play-time: (get total-play-time profile),
      favorite-game-mode: (get favorite-game-mode profile),
      achievements: (get achievements profile),
      social-links: (get social-links profile),
      bio: (get bio profile)
    })
  )
)

(define-read-only (get-achievement (achievement-id uint))
  (ok (map-get? achievements achievement-id))
)

(define-read-only (get-player-achievements (user principal))
  (let ((profile (unwrap-panic (map-get? player-profiles user))))
    (ok (get achievements profile))
  )
)

(define-read-only (get-leaderboard)
  (ok (map-get? leaderboard u1))
)

(define-read-only (has-achievement (user principal) (achievement-id uint))
  (let (
    (profile (unwrap-panic (map-get? player-profiles user)))
    (achievements-list (get achievements profile))
  )
    ;; Fixed: Check if achievement exists in the list
    (ok (is-some (index-of achievements-list achievement-id)))
  )
)

;; ------------------------------------
;; Admin Functions
;; ------------------------------------

(define-public (set-quest-rewards-contract (contract principal))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR-NOT-AUTHORIZED)
    (var-set quest-rewards-contract (some contract))
    (ok true)
  )
)

(define-public (add-achievement 
  (achievement-id uint)
  (name (string-utf8 50))
  (description (string-utf8 200))
  (icon-url (string-utf8 200))
  (rarity uint)
)
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR-NOT-AUTHORIZED)
    (asserts! (is-none (map-get? achievements achievement-id)) ERR-PROFILE-NOT-FOUND)
    
    (map-set achievements achievement-id {
      name: name,
      description: description,
      icon-url: icon-url,
      rarity: rarity
    })
    (ok true)
  )
)

;; ------------------------------------
;; Public Functions
;; ------------------------------------

(define-public (create-profile (username (string-utf8 50)) (bio (string-utf8 300)))
  (let (
    (user tx-sender)
    (existing-profile (map-get? player-profiles user))
  )
    (begin
      (asserts! (is-none existing-profile) ERR-PROFILE-NOT-FOUND)
      (map-set player-profiles user {
        username: username,
        join-date: block-height,
        total-play-time: u0,
        favorite-game-mode: u"classic",
        achievements: (list),
        social-links: u"",
        bio: bio
      })
      (ok true)
    )
  )
)

(define-public (update-profile (field (string-utf8 20)) (value (string-utf8 300)))
  (let (
    (user tx-sender)
    (profile (unwrap-panic (map-get? player-profiles user)))
  )
    (let (
      (updated-profile
        (if (is-eq field u"username")
          (merge profile { username: (unwrap-panic (as-max-len? value u50)) })
          (if (is-eq field u"bio")
            (merge profile { bio: value })
            (if (is-eq field u"social-links")
              (merge profile { social-links: (unwrap-panic (as-max-len? value u200)) })
              profile
            )
          )
        )
      )
    )
      (begin
        (map-set player-profiles user updated-profile)
        (ok true)
      )
    )
  )
)

(define-public (unlock-achievement (user principal) (achievement-id uint))
  (let (
    (profile (unwrap-panic (map-get? player-profiles user)))
    (current-achievements (get achievements profile))
  )
    (begin
      (asserts! (is-some (map-get? achievements achievement-id)) ERR-PROFILE-NOT-FOUND)
      ;; Fixed: Check if achievement is already unlocked using index-of
      (asserts! (is-none (index-of current-achievements achievement-id)) ERR-PROFILE-NOT-FOUND)
      (let (
        (updated-achievements (unwrap-panic (as-max-len? (append current-achievements achievement-id) u20)))
        (updated-profile {
          username: (get username profile),
          join-date: (get join-date profile),
          total-play-time: (get total-play-time profile),
          favorite-game-mode: (get favorite-game-mode profile),
          achievements: updated-achievements,
          social-links: (get social-links profile),
          bio: (get bio profile)
        })
      )
        (map-set player-profiles user updated-profile)
        (ok true)
      )
    )
  )
)

(define-public (update-play-time (additional-time uint))
  (let (
    (user tx-sender)
    (profile (unwrap-panic (map-get? player-profiles user)))
    (new-time (+ (get total-play-time profile) additional-time))
    (updated-profile {
      username: (get username profile),
      join-date: (get join-date profile),
      total-play-time: new-time,
      favorite-game-mode: (get favorite-game-mode profile),
      achievements: (get achievements profile),
      social-links: (get social-links profile),
      bio: (get bio profile)
    })
  )
    (map-set player-profiles user updated-profile)
    (ok true)
  )
)