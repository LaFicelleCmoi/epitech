import {
    getChannelByIdService,
    deleteChannelByIdService,
    updateChannelByIdService
} from "../Models/ChannelModel.js";

const handleResponse = (res, status, message, data = null) => {
  res.status(status).json({
    status,
    message,
    data
  });
};


export const getChannelById = async (req, res, next) => {
  try {
    const { channelId } = req.params;
    
    const channel = await getChannelByIdService(channelId);
    
    if (!channel)
      return handleResponse(res, 404, "Channel not found");
    
    handleResponse(res, 200, "Channel fetched successfully", channel);
  } catch (error) {
    next(error);
  }
};

export const deleteChannelById = async (req, res, next) => {
  try {
    const { channelId } = req.params;

    const deletedChannel = await deleteChannelByIdService(channelId);

    if (!deletedChannel)
      return handleResponse(res, 404, "Cannot delete channel");

    handleResponse(res, 200, "Channel deleted successfully");
  } catch (error) {
    next(error);
  }
};

export const updateChannelById = async (req, res, next) => {
  try {
    const { channelId } = req.params;
    const { name } = req.body;

    console.log("MODIFICATION CHANNEL:", channelId, "NOM:", name);

    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "Le nom du channel est vide" });
    }

    const updateChannel = await updateChannelByIdService(channelId, name);

    if (!updateChannel)
      return res.status(404).json({ message: "Cannot update channel" });

    res.status(200).json({ message: "Channel updated successfully", data: updateChannel });
  } catch (error) {
    console.error("ERREUR UPDATE CHANNEL:", error);
    next(error);
  }
};