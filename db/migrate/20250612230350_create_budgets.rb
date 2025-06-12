class CreateBudgets < ActiveRecord::Migration[7.1]
  def change
    create_table :budgets do |t|
      t.string :type
      t.decimal :amount, precision: 12, scale: 2
      t.string :currency
      t.text :description, default: "", null: false
      t.references :billing_cycle, null: true, foreign_key: true

      t.timestamps
    end
  end
end
