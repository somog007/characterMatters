import { Response } from 'express';
import EBook from '../models/Ebook';
import Order from '../models/Order';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';

export const getEBooks = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 10, category, minPrice, maxPrice } = req.query;
    
    const filter: any = {};
    if (category) filter.category = category;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const ebooks = await EBook.find(filter)
      .populate('category')
      .populate('createdBy', 'name')
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit))
      .sort({ createdAt: -1 });

    const total = await EBook.countDocuments(filter);

    res.json({
      ebooks,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getEBook = async (req: AuthRequest, res: Response) => {
  try {
    const ebook = await EBook.findById(req.params.id)
      .populate('category')
      .populate('createdBy', 'name avatar');

    if (!ebook) {
      return res.status(404).json({ message: 'EBook not found' });
    }

    // Check if user has purchased the ebook
    let hasPurchased = false;
    if (req.user) {
      const order = await Order.findOne({
        user: (req.user as any)._id,
        eBook: ebook._id,
        status: 'completed',
      });
      hasPurchased = !!order;
    }

    res.json({ ...ebook.toObject(), hasPurchased });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const createEBook = async (req: AuthRequest, res: Response) => {
  try {
    const ebookData = {
      ...req.body,
      createdBy: (req.user as any)?._id,
    };

    const ebook = new EBook(ebookData);
    await ebook.save();

    await ebook.populate('category');
    await ebook.populate('createdBy', 'name');

    res.status(201).json(ebook);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const purchaseEBook = async (req: AuthRequest, res: Response) => {
  try {
    const ebook = await EBook.findById(req.params.id);
    
    if (!ebook) {
      return res.status(404).json({ message: 'EBook not found' });
    }

    // Check if already purchased
    const existingOrder = await Order.findOne({
      user: (req.user as any)?._id,
      eBook: ebook._id,
      status: 'completed',
    });

    if (existingOrder) {
      return res.status(400).json({ message: 'EBook already purchased' });
    }

    // Create order (payment will be handled by webhook)
    const order = new Order({
      user: (req.user as any)?._id,
      eBook: ebook._id,
      amount: ebook.price,
      status: 'pending',
    });

    await order.save();

    // In a real application, you would integrate with Stripe here
    // For now, we'll simulate successful payment
    order.status = 'completed';
    await order.save();

    // Add eBook to user's purchased collection
    await User.findByIdAndUpdate((req.user as any)?._id, {
      $addToSet: { purchasedEBooks: ebook._id },
    });

    // Increment sales count
    ebook.salesCount = (ebook.salesCount || 0) + 1;
    await ebook.save();

    res.json({ message: 'Purchase successful', order });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};