// controllers/orderController.js
import Order from '../models/orderModel.js';
import Product from '../models/productModel.js';
import User from '../models/userModel.js';

// Create new order
export const createOrder = async (req, res) => {
  try {
    const { customer, customerDetails, items, totalAmount, notes } = req.body;

    console.log('Order creation request received:', {
      customer: customer ? 'present' : 'missing',
      customerDetails: customerDetails ? 'present' : 'missing',
      itemsCount: items?.length,
      totalAmount,
      hasNotes: !!notes
    });

    // Validate required fields
    if (!customer || !customerDetails || !items || !totalAmount) {
      const missingFields = [];
      if (!customer) missingFields.push('customer');
      if (!customerDetails) missingFields.push('customerDetails');
      if (!items || !Array.isArray(items)) missingFields.push('items');
      if (!totalAmount) missingFields.push('totalAmount');
      
      console.error('Missing required fields:', missingFields);
      return res.status(400).json({ 
        error: 'Missing required fields', 
        details: missingFields 
      });
    }
    
    // Validate items array
    if (!Array.isArray(items) || items.length === 0) {
      console.error('Invalid items array');
      return res.status(400).json({ error: 'Items must be a non-empty array' });
    }

    // Process items to ensure seller information is present
    const processedItems = [];
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      console.log(`Processing item ${i + 1}:`, {
        product: item.product,
        quantity: item.quantity,
        hasSeller: !!item.seller
      });
      
      // Validate item has required fields
      if (!item.product || !item.quantity || item.quantity < 1) {
        console.error('Invalid item:', item);
        return res.status(400).json({ 
          error: `Item ${i + 1} is missing required fields: product, quantity` 
        });
      }
      
      // If seller is not provided, fetch it from the product
      if (!item.seller) {
        const product = await Product.findById(item.product);
        console.log(`Product for item ${i + 1}:`, {
          found: !!product,
          hasSeller: !!(product?.seller)
        });
        
        if (product && product.seller) {
          item.seller = product.seller;
        } else {
          console.error(`No seller found for product ${item.product}`);
          return res.status(400).json({ 
            error: `Product ${item.product} has no seller assigned` 
          });
        }
      }
      
      processedItems.push({
        ...item,
        seller: item.seller
      });
    }
    
    console.log('Processed items count:', processedItems.length);

    // Create order
    const order = new Order({
      customer,
      customerDetails,
      items: processedItems,
      totalAmount,
      notes: notes || ''
    });

    await order.save();
    await order.populate('items.product');
    await order.populate('items.seller');

    res.status(201).json({
      message: 'Order created successfully',
      order: order
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get orders for a specific seller
export const getOrdersBySeller = async (req, res) => {
  try {
    const { sellerId } = req.params;

    const orders = await Order.find({
      'items.seller': sellerId
    })
    .populate('customer', 'name email phone')
    .populate('items.product', 'name description photo category')
    .populate('items.seller', 'name email')
    .sort({ createdAt: -1 });

    res.status(200).json({
      message: 'Orders fetched successfully',
      orders: orders
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get order by ID
export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
      .populate('customer', 'name email phone')
      .populate('items.product', 'name description photo category')
      .populate('items.seller', 'name email');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.status(200).json({
      message: 'Order fetched successfully',
      order: order
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update order status
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, notes, trackingNumber } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Update status
    order.status = status || order.status;
    order.notes = notes || order.notes;
    order.trackingNumber = trackingNumber || order.trackingNumber;

    // Update delivery status based on order status
    if (status === 'accepted') {
      order.deliveryStatus = 'pending';
      order.acceptedAt = new Date(); // Track when order was accepted
      order.viewedByCustomer = false; // Mark as unviewed by customer
    } else if (status === 'cancelled') {
      order.cancelledAt = new Date(); // Track when order was cancelled
      order.viewedByCustomer = false; // Mark as unviewed by customer
    } else if (status === 'shipped') {
      order.deliveryStatus = 'shipped';
    } else if (status === 'delivered') {
      order.deliveryStatus = 'delivered';
    }

    await order.save();
    await order.populate('customer', 'name email phone');
    await order.populate('items.product', 'name description photo category');
    await order.populate('items.seller', 'name email');

    res.status(200).json({
      message: 'Order status updated successfully',
      order: order
    });
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update delivery status
export const updateDeliveryStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { deliveryStatus, trackingNumber } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Update delivery status
    order.deliveryStatus = deliveryStatus || order.deliveryStatus;
    order.trackingNumber = trackingNumber || order.trackingNumber;

    // Update order status based on delivery status
    if (deliveryStatus === 'delivered') {
      order.status = 'delivered';
    } else if (deliveryStatus === 'shipped') {
      order.status = 'shipped';
    }

    await order.save();
    await order.populate('customer', 'name email phone');
    await order.populate('items.product', 'name description photo category');
    await order.populate('items.seller', 'name email');

    res.status(200).json({
      message: 'Delivery status updated successfully',
      order: order
    });
  } catch (error) {
    console.error('Error updating delivery status:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get orders for a specific customer
export const getOrdersByCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;

    const orders = await Order.find({
      customer: customerId
    })
    .populate('customer', 'name email phone')
    .populate('items.product', 'name description photo category')
    .populate('items.seller', 'name email')
    .sort({ createdAt: -1 });

    res.status(200).json({
      message: 'Orders fetched successfully',
      orders: orders
    });
  } catch (error) {
    console.error('Error fetching customer orders:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get all orders (admin)
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('customer', 'name email phone')
      .populate('items.product', 'name description photo category')
      .populate('items.seller', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: 'Orders fetched successfully',
      orders: orders
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: error.message });
  }
};

// Mark customer orders as viewed
export const markOrdersAsViewed = async (req, res) => {
  try {
    const { customerId } = req.params;

    // Update all accepted and cancelled orders (with dates) for this customer to viewed
    await Order.updateMany(
      { 
        customer: customerId,
        $or: [
          { status: 'accepted', acceptedAt: { $exists: true }, viewedByCustomer: false },
          { status: 'cancelled', cancelledAt: { $exists: true }, viewedByCustomer: false }
        ]
      },
      { 
        viewedByCustomer: true
      }
    );

    res.status(200).json({
      message: 'Orders marked as viewed'
    });
  } catch (error) {
    console.error('Error marking orders as viewed:', error);
    res.status(500).json({ error: error.message });
  }
};
