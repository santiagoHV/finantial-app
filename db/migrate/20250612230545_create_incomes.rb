class CreateIncomes < ActiveRecord::Migration[7.1]
  def change
    create_table :incomes do |t|
      t.decimal :amount, precision: 12, scale: 2
      t.date :date
      t.text :description, default: "", null: false
      t.references :income_source, null: false, foreign_key: true

      t.timestamps
    end
  end
end
