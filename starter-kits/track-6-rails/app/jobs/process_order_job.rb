class ProcessOrderJob < ApplicationJob
  queue_as :default
  retry_on StandardError, wait: :polynomially_longer, attempts: 3

  discard_on ActiveJob::DeserializationError

  def perform(order_id)
    order = Order.find(order_id)
    order.processing!
    PaymentService.charge(order)
    order.completed!
    OrderMailer.confirmation(order).deliver_later
  rescue PaymentError => e
    order.failed!
    Rails.logger.error("Payment failed for order #{order_id}: #{e.message}")
  end
end
