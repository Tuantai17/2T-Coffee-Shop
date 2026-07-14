CREATE TABLE tier_benefit_claims (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    tier_code VARCHAR(30) NOT NULL,
    claim_year INT NOT NULL,
    claim_month INT NOT NULL,
    claimed_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_tier_benefit_claims_user_month ON tier_benefit_claims(user_id, claim_year, claim_month);
