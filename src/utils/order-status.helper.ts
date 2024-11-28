import {
  AdminOrderStatus,
  CustomerOrderStatus,
} from 'src/enum/order-status.eum';

export const getAdminOrderStatusLabel = (
  orderStatus: number,
  branchId?: number,
  pickupBoyId?: number,
  workshopId?: number,
): string => {
  switch (orderStatus) {
    case 1:
      if (!branchId) return AdminOrderStatus.ASSIGN_BRANCH;
      if (!pickupBoyId) return AdminOrderStatus.ASSIGN_PICKUP_BOY;
      return AdminOrderStatus.READY_TO_PICKUP;

    case 2:
      return AdminOrderStatus.RECEIVED_BY_PICKUP_BOY;

    case 3:
      return AdminOrderStatus.ITEMS_RECEIVED_AT_BRANCH;

    case 4:
      if (!workshopId) return AdminOrderStatus.ASSIGN_WORKSHOP;

    case 5:
      return AdminOrderStatus.RECEIVED_AT_WORKSHOP;

    case 6:
      return AdminOrderStatus.WORK_IN_PROGRESS;

    case 7:
      return AdminOrderStatus.ON_THE_WAY_TO_BRANCH;

    case 8:
      return AdminOrderStatus.WORK_COMPLETED;

    case 9:
      return AdminOrderStatus.READY_FOR_DELIVERY;

    case 10:
      return AdminOrderStatus.DELIVERED;
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
      return CustomerOrderStatus.IN_PROCESS;

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
      return CustomerOrderStatus.IN_PROCESS;

    case 10:
      return CustomerOrderStatus.READY_FOR_DELIVERY;

    default:
      return '';
  }
};
