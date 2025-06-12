# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.1].define(version: 2025_06_12_230545) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "billing_cycles", force: :cascade do |t|
    t.string "name"
    t.date "start_date"
    t.date "end_date"
    t.string "type"
    t.text "description"
    t.bigint "user_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_billing_cycles_on_user_id"
  end

  create_table "budgets", force: :cascade do |t|
    t.string "type"
    t.decimal "amount", precision: 12, scale: 2
    t.string "currency"
    t.text "description", default: "", null: false
    t.bigint "billing_cycle_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["billing_cycle_id"], name: "index_budgets_on_billing_cycle_id"
  end

  create_table "expense_categories", force: :cascade do |t|
    t.string "name"
    t.string "color_code"
    t.bigint "budget_id", null: false
    t.bigint "user_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["budget_id"], name: "index_expense_categories_on_budget_id"
    t.index ["user_id"], name: "index_expense_categories_on_user_id"
  end

  create_table "expenses", force: :cascade do |t|
    t.decimal "amount", precision: 12, scale: 2
    t.text "description", default: "", null: false
    t.string "currency"
    t.date "date"
    t.bigint "expense_category_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["expense_category_id"], name: "index_expenses_on_expense_category_id"
  end

  create_table "income_sources", force: :cascade do |t|
    t.string "name"
    t.bigint "user_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_income_sources_on_user_id"
  end

  create_table "incomes", force: :cascade do |t|
    t.decimal "amount", precision: 12, scale: 2
    t.date "date"
    t.text "description", default: "", null: false
    t.bigint "income_source_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["income_source_id"], name: "index_incomes_on_income_source_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "name"
    t.string "lastname"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  add_foreign_key "billing_cycles", "users"
  add_foreign_key "budgets", "billing_cycles"
  add_foreign_key "expense_categories", "budgets"
  add_foreign_key "expense_categories", "users"
  add_foreign_key "expenses", "expense_categories"
  add_foreign_key "income_sources", "users"
  add_foreign_key "incomes", "income_sources"
end
