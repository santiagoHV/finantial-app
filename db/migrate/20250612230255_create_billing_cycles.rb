class CreateBillingCycles < ActiveRecord::Migration[7.1]
  def change
    create_table :billing_cycles do |t|
      t.string :name
      t.date :start_date
      t.date :end_date
      t.string :type
      t.text :description
      t.references :user, null: false, foreign_key: true

      t.timestamps
    end
  end
end
