class Budget < ApplicationRecord
  belongs_to :billing_cycle
  belongs_to :category
end
