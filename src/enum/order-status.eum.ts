export enum OrderStatus {
  PICKUP_PENDING = 1,
  ITEMS_RECEIVED_BY_PICKUP_BOY = 2,
  ITEMS_RECEIVED_AT_BRANCH = 3,
  WORKSHOP_RECEIVED_ITEMS = 4,
  WORKSHOP_MOVED_TO_IN_PROCESS = 5,
  WORKSHOP_MARKS_AS_COMPLETED = 6,
  BRANCH_RECEIVED_ITEMS = 7,
  BRANCH_ASSIGN_DELIVERY_BOY = 8,
  DELIVERY_BOY_MARKS_AS_COMPLETED = 9,
}

export enum AdminOrderStatus {
  ASSIGN_BRANCH = 'Assign Branch',
  ASSIGN_PICKUP_BOY = 'Assign Pickup Boy',
  READY_TO_PICKUP = 'Ready To Pickup',
  RECEIVED_BY_PICKUP_BOY = 'Received By Pickup Boy',
  ITEMS_RECEIVED_AT_BRANCH = 'Items Received At Branch',
  PICKUP_COMPLETE = 'Pickup Complete',
  ASSIGN_WORKSHOP = 'Assign Workshop',
  RECEIVED_AT_WORKSHOP = 'Received At Workshop',
  WORK_IN_PROGRESS = 'Work In Progress',
  ON_THE_WAY_TO_BRANCH = 'On The Way To Branch',
  WORK_COMPLETED = 'Work Completed',
  READY_FOR_DELIVERY = 'Ready For Delivery',
  DELIVERED = 'Delivered',
}

export enum CustomerOrderStatus {
  WAITING_FOR_PICKUP = 'Waiting For Pickup',
  PICKUP_COMPLETE = 'Pickup Completed',
  IN_PROCESS = 'In Process',
  READY_FOR_DELIVERY = 'Ready For Delivery',
  DELIVERED = 'Delivered',
}

export enum WorkshopOrderStatus {
  ON_THE_WAY = 'On The Way',
  ORDER_RECEIVED = 'Order Received',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
}
