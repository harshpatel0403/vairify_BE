import Chat from "../Models/ChatModal.js";
import DateGuardAlarms from "../Models/DateGuardAlarmModal.js";
import DateGuardMember from "../Models/DateGuardMemberModal.js";

export const addUser = async ({ id, alarmId, memberId }) => {

    var alarmDetails = await DateGuardAlarms.findOne({ _id: alarmId }).populate('chat.memberId').sort({ ['chat.dateTime']: 1 })
    if (!alarmDetails || !alarmDetails.alarmDecoyed) {
        return { error: 'No Alarms decoyed yet' }
    }

    alarmDetails = alarmDetails.toJSON()

    const member = await DateGuardMember.findOne({ _id: memberId })

    if (!member) {
        return { error: "You are not exists in our records" }
    }

    let existingMember = alarmDetails.members.find(member => member.memberId.toString() == memberId)
    let newMembers = []
    if (existingMember) {
        newMembers = alarmDetails.members.map(member => {
            if (member.memberId.toString() == memberId) {
                return { ...member, status: 'online', socketId: id }
            }
            return member
        })
    } else {
        newMembers.push({
            memberId: memberId,
            socketId: id,
            status: 'online'
        })
    }
    await DateGuardAlarms.updateOne({ _id: alarmId }, {
        $set: {
            members: newMembers
        }
    })
    return { user: { ...(member.toJSON() || {}), alarmId }, chat: alarmDetails.chat, members: newMembers.filter(member => member.status == 'online').map(member => member.memberId.toString()) };
};

export const disconnectUser = async (id) => {
    let alarm = await DateGuardAlarms.findOne({ [`members.socketId`]: id })
    if (alarm) {
        alarm = alarm.toJSON()
        let memberId
        let newMembers = []
        newMembers = alarm.members.map(member => {
            if (member.socketId === id) {
                memberId = member.memberId.toString()
                return { ...member, status: 'offline' }
            }
            return member
        })
        // await alarm.save()
        console.log(newMembers, ' <=== nmew members to updates..')
        await DateGuardAlarms.updateOne({ [`members.socketId`]: id }, {
            $set: {
                members: newMembers
            }
        })
        let member = await DateGuardMember.findOne({ _id: memberId })
        return { member: member ? member.toJSON() : null, onlineMembers: newMembers.filter(member => member.status == 'online').map(member => member.memberId.toString()), alarmId: alarm._id.toString() }
    }
    return false
};

export const getUser = async (id, alarmId) => {
    const alarmDetails = await DateGuardAlarms.findOne({ _id: alarmId })

    if (!alarmDetails) {
        return false
    }

    let member = alarmDetails.members.find(member => member.socketId === id)
    if (!member) {
        return false
    }
    return (await DateGuardMember.findOne({ _id: member.memberId.toString() })).toJSON() || false

};

export const saveMessage = async (id, alarmId, memberId, message) => {
    const alarmDetails = await DateGuardAlarms.findOne({ _id: alarmId })

    if (!alarmDetails) {
        return false
    }

    alarmDetails.chat.push({
        memberId: memberId,
        message,
        dateTime: new Date
    })

    await alarmDetails.save()
    var updatedAlarmDetails = await DateGuardAlarms.findOne({ _id: alarmId }).populate('chat.memberId').sort({ ['chat.dateTime']: 1 })
    if (updatedAlarmDetails) {
        updatedAlarmDetails = updatedAlarmDetails.toJSON()
    }
    return updatedAlarmDetails.chat //(await DateGuardMember.findOne({ _id: member.memberId.toString() })).toJSON() || false
};

export const getUsersInGroup = (group) => users.filter((user) => user.group === group);



export const joinInAppChat = async ({ id, userId, receiverId }) => {

    var chat = await Chat.findOne({ $or: [ { senderId: userId, receiverId }, { senderId: receiverId, receiverId: userId } ] })

    if(!chat) {
        chat = await Chat.create({ senderId: userId, receiverId, senderSocketId: id, messages: [] })
    }

    if(chat.senderId.toString() !== userId) {
        chat.receiverSocketId = id
        await chat.save()
    } else {
        chat.senderSocketId = id
        await chat.save()
    }

    return chat
};

export const saveInAppMessage = async (id, userId, receiverId, message) => {
    try {
        var chat = await Chat.findOne({ $or: [ { senderId: userId, receiverId }, { senderId: receiverId, receiverId: userId } ] })

        if(!chat) {
            chat = await Chat.create({ senderId: userId, receiverId, senderSocketId: id, messages: [] })
        }

        if(chat.senderId.toString() !== userId) {
            chat.receiverSocketId = id
            // await chat.save()
        } else {
            chat.senderSocketId = id
            // await chat.save()
        }
    
        chat.messages.push({
            message,
            dateTime: new Date,
            socketId: id,
            userId: userId
        })
    
        await chat.save()
    
        return chat
    } catch(error) {
        console.log(error)
        return false
    }
}

export const fetchInAppMessages = async (userId) => {
    try {
        var chat = await Chat.find({
            $or: [
                { senderId: userId },
                { receiverId: userId }
            ]
        }, {}, { sort: { updatedAt: -1 } }).populate('senderId').populate('receiverId').exec()
    
        return chat
    } catch(error) {
        console.log(error)
        return false
    }
}