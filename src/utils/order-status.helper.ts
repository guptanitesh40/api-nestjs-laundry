import {
  CustomerOrderStatus,
  WorkshopOrderStatus,
} from 'src/enum/order-status.eum';
import { Order } from '../entities/order.entity';

const orderStatusFlow = {
  2: {
    admin_label: 'Pickup Boy Assigned ( Ready to pickup )',
    description:
      'The pickup boy has been assigned and will be accepting the clothes shortly. If the pickup boy is unable to accept the order through the app, please click on "Received by Pickup Boy" to manually mark the order as accepted.',
    next_step: 'Received by pickup boy',
  },
  3: {
    admin_label: 'Pickup Complete',
    description:
      'The pickup boy has collected the clothes. Now, confirm that the branch has received the order.',
    next_step: 'Items Received at Branch',
  },
  5: {
    admin_label: 'Workshop Assigned (On the Way)',
    description:
      'The order has been assigned to the workshop for processing. It will be accepted by the workshop upon its arrival.',
    next_step: 'Order Received at Workshop',
  },
  6: {
    admin_label: 'Order Received at Workshop',
    description:
      'The workshop has received the order and is ready for further processing.',
    next_step: 'Workshop Marks Order In Progress',
  },
  7: {
    admin_label: 'Order Work In Progress',
    description:
      'Workshop has started processing the order and it is now in progress.',
    next_step: 'Work Completed by Workshop',
  },
  8: {
    admin_label: 'Work Completed by Workshop',
    description:
      'The workshop has completed processing the order. The items will be dispatched back to the branch. If the branch has received the order from the workshop, please click the "Items Received from workshop" button to proceed.',
    next_step: 'Mark as Received at Branch',
  },
  9: {
    admin_label: 'Order Completed ( Received at branch )',
    description:
      'The branch has received the processed items and is now ready to deliver them to the customer.',
    next_step: 'Assign Delivery boy',
  },
  10: {
    admin_label: 'Ready for delivery',
    description:
      'A delivery boy has been assigned to deliver the items to the customer. If the delivery boy cannot mark the order as delivered via the app, manually confirm the delivery as "Delivered".',
    next_step: 'Delivered',
  },
  11: {
    admin_label: 'Delivered',
    description:
      'The delivery boy has completed the delivery and the order has been successfully delivered to the customer.',
    next_step: null,
  },
  12: {
    admin_label: 'Cancelled By Admin',
    description:
      'The order has been cancelled by the admin, either upon the customer’s request or due to an internal issue. No further actions are required, and the order will not proceed to delivery.',
    next_step: null,
  },
  13: {
    admin_label: 'Cancelled By Customer',
    description:
      'The order has been cancelled by the customer. No further actions are required, and the order will not proceed to delivery.',
    next_step: null,
  },
};

export const getOrderStatusDetails = (order: Order) => {
  if (order.order_status === 1) {
    if (order.created_by_user_id) {
      if (!order.branch_id) {
        return {
          admin_label: 'Order Placed',
          description:
            'The admin has successfully created an order. Assign a branch so the branch can manage and proceed with the order.',
          next_step: 'Assign Branch',
        };
      } else {
        return {
          admin_label: 'Branch Assigned',
          description:
            'Admin has created the order, and now a Pickup Boy needs to be assigned.',
          next_step: 'Assign Pickup Boy',
        };
      }
    } else {
      if (!order.branch_id) {
        return {
          admin_label: 'Order Placed',
          description:
            'The customer has successfully placed an order. Assign a branch so the branch can manage and proceed with the order.',
          next_step: 'Assign Branch',
        };
      } else {
        return {
          admin_label: 'Branch Assigned',
          description:
            'A branch has been assigned to the order. Next, assign a pickup boy to collect the order.',
          next_step: 'Assign Pickup Boy',
        };
      }
    }
  }

  if (order.order_status === 4) {
    if (order.created_by_user_id && !order.pickup_boy_id) {
      return {
        admin_label: 'Items Received at Branch',
        description:
          'Admin has created the order, and the items are now received at the branch directly from customer.',
        next_step: 'Assign Workshop',
      };
    } else {
      return {
        admin_label: 'Items Received at Branch',
        description:
          'The branch has received the clothes from the pickup boy. Assign a workshop for processing.',
        next_step: 'Assign Workshop',
      };
    }
  }

  if (orderStatusFlow[order.order_status]) {
    return orderStatusFlow[order.order_status];
  } else {
    return null;
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
      if (!workshopId) return CustomerOrderStatus.WAITING_FOR_PICKUP;

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
      return CustomerOrderStatus.IN_PROCESS;

    case 10:
      return CustomerOrderStatus.READY_FOR_DELIVERY;

    case 11:
      return CustomerOrderStatus.DELIVERED;

    case 12:
      return CustomerOrderStatus.ORDER_CANCELLED;

    case 13:
      return CustomerOrderStatus.ORDER_CANCELLED;

    default:
      return '';
  }
};

export const getWorkshopOrdersStatusLabel = (orderStatus: number): string => {
  switch (orderStatus) {
    case 6:
      return WorkshopOrderStatus.ORDER_RECEIVED;

    case 7:
      return WorkshopOrderStatus.IN_PROGRESS;

    case 8:
      return WorkshopOrderStatus.COMPLETED;
  }
};

export const getOrderStatusList = (currentStatus: number): any[] => {
  const statusFlow = [
    {
      order_status: [1],
      status: 'Order Placed',
      description: 'Order placed successfully.',
    },
    {
      order_status: [2],
      status: 'Waiting for Pickup',
      description: 'Pickup boy assigned.',
    },
    {
      order_status: [3, 4, 5, 6],
      status: 'Pickup Complete',
      description: 'Clothes picked up.',
    },
    {
      order_status: [7, 8],
      status: 'Work In Progress',
      description: 'Workshop processing items.',
    },
    {
      order_status: [9],
      status: 'Ready for Delivery',
      description: 'Items ready for delivery.',
    },
    {
      order_status: [10, 11],
      status: 'Delivered',
      description: 'Order delivered.',
    },
  ];

  const currentStatusIndex = statusFlow.findIndex((status) =>
    status.order_status.includes(currentStatus),
  );

  return statusFlow.map((status, index) => ({
    status: status.status,
    date: index <= currentStatusIndex ? new Date().toDateString() : null,
    statusDescription: status.description,
    isProgress: index <= currentStatusIndex,
  }));
};
