class CreateExpenses < ActiveRecord::Migration[7.1]
  def change
    create_table :expenses do |t|
      t.decimal :amount, precision: 12, scale: 2
      t.text :description, default: "", null: false
      t.string :currency
      t.date :date
      t.references :expense_category, null: false, foreign_key: true

      t.timestamps
    end
  end
end
