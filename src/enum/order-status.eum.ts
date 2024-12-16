export enum OrderStatus {
  PICKUP_PENDING_OR_BRANCH_ASSIGNMENT_PENDING = 1,
  ASSIGNED_PICKUP_BOY = 2,
  PICKUP_COMPLETED_BY_PICKUP_BOY = 3,
  ITEMS_RECEIVED_AT_BRANCH = 4,
  WORKSHOP_ASSIGNED = 5,
  WORKSHOP_RECEIVED_ITEMS = 6,
  WORKSHOP_WORK_IN_PROGRESS = 7,
  WORKSHOP_WORK_IS_COMPLETED = 8,
  ORDER_COMPLETED_AND_RECEIVED_AT_BRANCH = 9,
  DELIVERY_BOY_ASSIGNED_AND_READY_FOR_DELIVERY = 10,
  DELIVERED = 11,
  CANCELLED = 12,
}

export enum AdminOrderStatus {
  ORDER_PLACED = 'Order Placed',
  BRANCH_ASSIGNED = 'Branch Assigned',
  READY_TO_PICKUP = 'Ready to Pickup',
  RECEIVED_BY_PICKUP_BOY = 'Received by Pickup Boy',
  PICKUP_COMPLETE = 'Pickup Complete',
  ITEMS_RECEIVED_AT_BRANCH = 'Items Received at Branch',
  ASSIGN_WORKSHOP = 'Assign Workshop',
  ORDER_RECEIVED_AT_WORKSHOP = 'Order Received at Workshop',
  WORK_IN_PROGRESS = 'Work In Progress',
  WORK_COMPLETED = 'Work Completed by Workshop',
  ORDER_COMPLETED = 'Order Completed (Received at Branch)',
  ASSIGN_DELIVERY_BOY = 'Assign Delivery Boy',
  READY_FOR_DELIVERY = 'Ready for Delivery',
  DELIVERED = 'Delivered',
  ORDER_CANCELLED = 'Order Cancelled',
}

export enum CustomerOrderStatus {
  WAITING_FOR_PICKUP = 'Waiting For Pickup',
  PICKUP_COMPLETE = 'Pickup Completed',
  IN_PROCESS = 'In Process',
  READY_FOR_DELIVERY = 'Ready For Delivery',
  DELIVERED = 'Delivered',
  ORDER_CANCELLED = 'Items Cancelled',
}

export enum WorkshopOrderStatus {
  ORDER_RECEIVED = 'Order Received',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
}
