const { MongoClient, ObjectId } = require('mongodb');
const { mongoURL, dbFolder } = require('../mongoDB-config');
const uuid = require('uuid');


module.exports.initChat = async (sender, receiver) => {
    return new Promise(async (resolve, reject) => {
        const chatID = uuid.v4();
        const res1 = await this.createChat(sender, receiver, chatID);
        console.log("RES1:", res1); 
        if (res1) {
            const res2 = await this.createChat(receiver, sender, chatID);
            console.log("RES2:", res2);
            if (!res2) {
                this.deleteChat(sender, receiver, chatID);
                console.log("Kan inte skapa chatten just nu");
                resolve(false);
            }
            else {
                const db = await MongoClient.connect(mongoURL);
                const dbo = db.db(dbFolder);
                dbo.collection('chats').insertOne({ [chatID] : [] }, (err, res) => {
                    if (err) {
                        console.log(err);
                        db.close();
                        resolve(false);
                    } else {
                        console.log(res);
                        db.close();
                        resolve(chatID);
                    }
                });
            }     
        }
        else {
            resolve(false);
        }
    });
}


module.exports.deleteChat = async (user, chatter, chatID) => {
    console.log(mongoURL);
    console.log(dbFolder);
    const db = await MongoClient.connect(mongoURL);
    const dbo = db.db(dbFolder);
    const key = 'chats.' + chatID;
    dbo.collection('users').updateOne({'profile.accountName': user}, { $unset: { [key]: 1 } }, (err, res) => {
        if (err) {
            console.log(err);
            db.close(); 
        }
        else {
            db.close();
        }
    }); 
}


module.exports.createChat = (user, chatter, chatID) => {
    return new Promise( async (resolve, reject) => {
        const db = await MongoClient.connect(mongoURL);
        const dbo = db.db(dbFolder);
        const key = 'chats.' + chatID;
        dbo.collection('users').updateOne({'profile.accountName': user}, { $set: { [key]: chatter } }, (err, res) => {
            if (err) {
                console.log(err);
                db.close();
                resolve(false);
            } else if (res.matchedCount > 0) {
                console.log(res);
                db.close();
                resolve(true);
            }
            else {
                db.close();
                resolve(false);
            }
        });
    });
}


module.exports.chatExists = async (user, chatter) => {
    const chatExist = await this.checkChatStatus(user,chatter);
    if (!chatExist) {
        const chatID = await this.initChat(user, chatter);
        return chatID;
    }
    else {
        const chatID = await this.getChatID(user, chatter);
        if (chatID === false) {
            console.log("Kan inte hämta chatten");
            return chatID;
        }   
        else {
            console.log(chatID);
            return chatID;
        //     const chatHistory =  await this.getChatHistory(chatID);
        //     if (chatHistory === false) {
        //         console.log("Kan inte hämta chattens historia");
        //     }
        //     else {
        //         console.log(chatHistory);
        //         return chatHistory;
        //     }
        }
    }
}

module.exports.getAllChatIDs = async (user) => {
    return new Promise( async (resolve, reject) => {
        const db = await MongoClient.connect(mongoURL);
        const dbo = db.db(dbFolder);
        dbo.collection('users').findOne({'profile.accountName': user}, (err, res) => {
            if (err) {
                console.log(err);
                db.close();
                resolve(false);
            } else if (res.chats) {
                console.log(res.chats);
                db.close();
                resolve(res.chats);
            }
            else {
                db.close();
                resolve(false);
            }
        });
    });
}

module.exports.getAllChatHistories = async (user) => {
    return new Promise( async (resolve, reject) => {
        console.log(user);
        const chatIDs = await this.getAllChatIDs(user);
        if (chatIDs === false) {
            console.log("Kan inte hämta chattens historia");
            resolve(false);
        }
        else {
            const chatHistories = [];
            for (const [key, val] of Object.entries(chatIDs)) {
                const chatHistory = await this.getChatHistory(key);
                if (chatHistory === false) {
                    console.log("Kan inte hämta chattens historia");
                    //resolve(false);
                }
                else {
                    console.log(chatHistory);
                    chatHistories.push({[val]: chatHistory, chatID: key});
                }
            }
            //resolve(true);
            resolve(chatHistories);
        }
    });
}


module.exports.getChatHistory = async (chatID) => {
    return new Promise(async (resolve, reject) => {
        const db = await MongoClient.connect(mongoURL);
        const dbo = db.db(dbFolder);
        dbo.collection('chats').findOne({[chatID]: {$exists: true}}, (err, res) => {
            if (err) {
                console.log(err);
                db.close();
                resolve(false);
            } else if (res) {
                console.log(res);
                db.close();
                resolve(res[chatID]);
            } else {
                db.close();
                resolve(false);
            }
        });
    });
}


module.exports.getChatID = async (user, chatter) => {
    return new Promise(async (resolve, reject) => {
        const db = await MongoClient.connect(mongoURL);
        const dbo = db.db(dbFolder);
        dbo.collection('users').findOne({ 'profile.accountName': user }, (err, res) => {
            if (err) {
                console.log(err);
                db.close();
                resolve(false);
            } else if (res.chats) {
                found_chatID = false;
                for (const [key, val] of Object.entries(res.chats)) {
                    if (val === chatter) {
                        db.close();
                        resolve(key);
                        found_chatID = true;
                    }
                }
                if (!found_chatID) {
                    db.close();
                    resolve(false);
                }
            }
            else {
                db.close();
                resolve(false);
            }
        });
    });
}


module.exports.checkChatStatus = async (user, chatter) => {
    return new Promise(async (resolve, reject) => {
        const db = await MongoClient.connect(mongoURL);
        const dbo = db.db(dbFolder);
        const key = 'chats.' + chatter;
        dbo.collection('users').findOne({ 'profile.accountName': user } , (err, res) => {
            if (err) {
                console.log(err);
                db.close();
                resolve(false);
            } else if (res) {
                console.log(res);
                if ('chats' in res) {
                    Object.values(res.chats).findIndex(val => val === chatter) > -1 ? resolve(true) : resolve(false);
                }
                else {
                    resolve(false);
                }
                db.close();
            } else {
                db.close();
                resolve(false);
            }
        });
    });
}


module.exports.storeChatMsg = async (chatID, msg) => {
    const db = await MongoClient.connect(mongoURL);
    const dbo = db.db(dbFolder);
    dbo.collection('chats').updateOne({[chatID]: {$exists: true}}, { $push: { [chatID]: msg } }, (err, res) => {
        if (err) {
            console.log(err);
            db.close();
        } else if (res) {
            console.log(res);
            db.close();
        } else {
            console.log(res);
            db.close();
        }
    });
}