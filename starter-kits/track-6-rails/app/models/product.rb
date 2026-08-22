class Product < ApplicationRecord
  belongs_to :tenant
  has_many :order_items, dependent: :destroy

  validates :name, presence: true, length: { maximum: 255 }
  validates :price, presence: true, numericality: { greater_than: 0 }

  scope :active, -> { where(deleted_at: nil) }
  scope :for_tenant, ->(tenant_id) { where(tenant_id: tenant_id) }

  broadcasts_to ->(product) { "products" }, inserts_by: :prepend
end
