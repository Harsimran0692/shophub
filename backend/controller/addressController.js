import addressModel from "../models/address.js";
import userModel from "../models/user.js";

export const getAddresses = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id);

    if (!user) {
      res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }
    const query = { user: req.user.id };
    const addresses = await addressModel.find(query);

    if (addAddress.length === 0) {
      return res.status(200).json({
        status: "success",
        data: [],
      });
    }

    res.status(200).json({
      status: "success",
      data: addresses,
    });
  } catch (error) {
    res.status(400).json({
      msg: `Failed to add address, ${error}`,
    });
  }
};

export const addAddress = async (req, res) => {
  const {
    firstName,
    lastName,
    streetAddress,
    postalCode,
    region,
    country,
    phoneNumber,
    email,
    addressType,
    isDefault,
  } = req.body;
  try {
    if (!firstName || !streetAddress || !postalCode || !country) {
      return res.status(400).json({
        status: "error",
        message:
          "First name, street address, postal code, and country are required",
      });
    }

    const user = await userModel.findById(req.user.id);

    if (!user) {
      res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    // Validate region requirement for US/CA
    if (["US", "CA"].includes(country) && !region) {
      return res.status(400).json({
        status: "error",
        message: "Region is required for US and CA addresses",
      });
    }

    const addressCount = await addressModel.countDocuments({
      user: req.user.id,
    });
    if (addressCount >= 5) {
      return res.status(400).json({
        status: "error",
        message: "Cannot add more addresses. Maximum limit of 5 reached.",
      });
    }

    if (isDefault) {
      await addressModel.updateMany(
        {
          user: req.user.id,
          addressType: addressType || "shipping",
          isDefault: true,
        },
        { isDefault: false }
      );
    }

    // Create new address
    let newAddress = new addressModel({
      user: req.user.id,
      firstName,
      lastName,
      streetAddress,
      postalCode,
      region: region || undefined, // Allow undefined for non-US/CA countries
      country: country.toUpperCase(), // Ensure ISO 3166-1 alpha-2 format
      phoneNumber,
      email,
      addressType: addressType || "shipping",
      isDefault: isDefault || false,
    });

    // console.log(newAddress);

    await newAddress.save();

    res.status(200).json({
      status: "success",
      data: newAddress,
    });
  } catch (error) {
    res.status(400).json({
      msg: `Failed to add address, ${error}`,
    });
  }
};

export const deleteAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const addressId = req.params.id;

    const address = await addressModel.findOne({
      user: userId,
      _id: addressId,
    });
    if (!address) {
      return res.status(404).json({
        status: "error",
        message: "User or Address not found",
      });
    }
    await addressModel.deleteOne({ _id: addressId });
    res.status(200).json({
      status: "success",
      message: "Address deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      msg: `Failed to delete address, ${error}`,
    });
  }
};

export const updateAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const addressId = req.params.id;
    const {
      firstName,
      lastName,
      streetAddress,
      postalCode,
      region,
      country,
      phoneNumber,
      email,
      addressType,
      isDefault,
    } = req.body;

    if (!firstName || !streetAddress || !postalCode || !country) {
      return res.status(400).json({
        status: "error",
        message:
          "First name, street address, postal code, and country are required",
      });
    }

    const address = await addressModel.findOneAndUpdate(
      { _id: addressId, user: userId },
      {
        $set: {
          firstName,
          lastName,
          streetAddress,
          postalCode,
          region,
          country,
          phoneNumber,
          email,
          addressType,
          isDefault,
        },
      },
      { new: true, runValidators: true }
    );

    if (!address) {
      return res.status(404).json({
        status: "error",
        message: "User or Address not found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Address updated successfully",
      data: address,
    });
  } catch (error) {
    res.status(500).json({
      msg: `Failed to update address, ${error}`,
    });
  }
};

export const patchAddress = async (req, res) => {
  try {
    const { isDefault } = req.body;
    const userId = req.user.id;
    const addressId = req.params.id;

    const address = await addressModel.findOneAndUpdate(
      { _id: addressId, user: userId },
      {
        $set: {
          isDefault,
        },
      },
      { new: true, runValidators: true }
    );

    if (!address) {
      return res.status(404).json({
        status: "error",
        message: "User or Address not found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Address patch updated successfully",
      data: address,
    });
  } catch (error) {
    res.status(500).json({
      msg: `Failed to patch address, ${error}`,
    });
  }
};
