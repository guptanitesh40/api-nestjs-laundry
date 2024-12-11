import {
  AdminOrderStatus,
  CustomerOrderStatus,
  WorkshopOrderStatus,
} from 'src/enum/order-status.eum';

export const getAdminOrderStatusLabel = (
  orderStatus: number,
  branchId?: number,
  pickupBoyId?: number,
  workshopId?: number,
  createAdmin?: number,
): string => {
  switch (orderStatus) {
    case 1:
      if (!branchId) return AdminOrderStatus.ASSIGN_BRANCH;
      if (!pickupBoyId) return AdminOrderStatus.ASSIGN_PICKUP_BOY;
      return AdminOrderStatus.READY_TO_PICKUP;

    case 2:
      return AdminOrderStatus.RECEIVED_BY_PICKUP_BOY;

    case 3:
      if (!createAdmin) {
        return AdminOrderStatus.ITEMS_RECEIVED_AT_BRANCH;
      }
      return AdminOrderStatus.PICKUP_COMPLETE;

    case 4:
      if (!workshopId) return AdminOrderStatus.ASSIGN_WORKSHOP;
      return AdminOrderStatus.RECEIVED_AT_WORKSHOP;

    case 5:
      return AdminOrderStatus.WORK_IN_PROGRESS;

    case 6:
      return AdminOrderStatus.WORK_COMPLETED;

    case 7:
      return AdminOrderStatus.BRANCH_RECEIVED_ITEMS;

    case 8:
      return AdminOrderStatus.ASSIGN_DELIVERY_BOY;

    case 9:
      return AdminOrderStatus.READY_FOR_DELIVERY;

    case 10:
      return AdminOrderStatus.DELIVERED;

    case 11:
      return AdminOrderStatus.ORDER_CANCELLED;

    default:
      return '';
  }
};

export const getCustomerOrderStatusLabel = (
  orderStatus: number,
  branchId?: number,
  pickupBoyId?: number,
  workshopId?: number,
): string => {
  switch (orderStatus) {
    case 1:
      if (!branchId || !pickupBoyId)
        return CustomerOrderStatus.WAITING_FOR_PICKUP;
    case 2:
      if (!workshopId) return CustomerOrderStatus.PICKUP_COMPLETE;

    case 3:
      return CustomerOrderStatus.PICKUP_COMPLETE;

    case 4:
      return CustomerOrderStatus.IN_PROCESS;

    case 5:
      return CustomerOrderStatus.IN_PROCESS;

    case 6:
      return CustomerOrderStatus.IN_PROCESS;

    case 7:
      return CustomerOrderStatus.IN_PROCESS;

    case 8:
      return CustomerOrderStatus.IN_PROCESS;

    case 9:
      return CustomerOrderStatus.READY_FOR_DELIVERY;

    case 10:
      return CustomerOrderStatus.DELIVERED;

    case 11:
      return AdminOrderStatus.ORDER_CANCELLED;

    default:
      return '';
  }
};

export const getWorkshopOrdersStatusLabel = (orderStatus: number): string => {
  switch (orderStatus) {
    case 4:
      return WorkshopOrderStatus.ORDER_RECEIVED;

    case 5:
      return WorkshopOrderStatus.IN_PROGRESS;

    case 6:
      return WorkshopOrderStatus.COMPLETED;
  }
};
