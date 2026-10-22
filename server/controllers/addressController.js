const Address = require('../models/Address');

// Get all saved addresses for current user
exports.getAddresses = async (req, res, next) => {
  try {
    const addresses = await Address.find({ user: req.user._id }).sort({ isDefault: -1, createdAt: -1 });
    res.status(200).json({
      success: true,
      count: addresses.length,
      data: addresses,
    });
  } catch (error) {
    next(error);
  }
};

// Add new address
exports.createAddress = async (req, res, next) => {
  try {
    const { label, houseNo, street, locality, landmark, city, state, pincode, isDefault, coordinates } = req.body;

    // If marked default, unset previous default
    if (isDefault) {
      await Address.updateMany({ user: req.user._id }, { isDefault: false });
    }

    const address = await Address.create({
      user: req.user._id,
      label: label || 'Home',
      houseNo,
      street,
      locality,
      landmark: landmark || '',
      city: city || 'Salem',
      state: state || 'Tamil Nadu',
      pincode,
      coordinates: coordinates || { lat: 11.6643, lng: 78.1460 },
      isDefault: Boolean(isDefault),
    });

    res.status(201).json({
      success: true,
      data: address,
    });
  } catch (error) {
    next(error);
  }
};

// Update address
exports.updateAddress = async (req, res, next) => {
  try {
    const address = await Address.findOne({ _id: req.params.id, user: req.user._id });
    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    if (req.body.isDefault) {
      await Address.updateMany({ user: req.user._id }, { isDefault: false });
    }

    Object.assign(address, req.body);
    await address.save();

    res.status(200).json({
      success: true,
      data: address,
    });
  } catch (error) {
    next(error);
  }
};

// Delete address
exports.deleteAddress = async (req, res, next) => {
  try {
    const address = await Address.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Address deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
