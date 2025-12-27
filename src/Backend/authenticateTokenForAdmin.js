



const Jwt = require('jsonwebtoken');
const SECRET_KEY = 'RAUNAK'
const db = require('./dbhelper')

const AdminToken = async (req, resp, next) => {
    let token = req.headers['authorization'];
    if (token) {
        let splittoken = token.split(" ");
        if (!splittoken[1]) {
            token = token;
        } else {
            token = splittoken[1];
        }

            // Verify token

        Jwt.verify(token, SECRET_KEY, async (err, user) => {
            if (err) {
                return resp.status(401).send({ status: 401, message: "Please enter valid token",user:user });
            } else {
                const decoded = Jwt.verify(token, SECRET_KEY);
                console.log(decoded.id, "decoded")
                
                // Check user status in MySQL
                const users = await db.excuteQuery(
                  'SELECT isDeleted,isDisable FROM partner WHERE pid = ?', 
                  [decoded.id]
                );  
                console.log(users, "users")
                if (users?.length > 0) {
                    const user = users[0];
                    if (user.isDeleted == 1) {
                        return resp.status(401).send({ status: 401, message: "User is Deleted" });
                    } else if (user.isDisable != 0) {
                        return resp.status(401).send({ status: 401, message: "User is disabled" });
                    }
                    
                }


            req.user = user;
            next();
            }
        })
    } else {
        resp.status(401).send({ status: 401, message: "UnAuthorize User..." });
    }
}


module.exports = AdminToken;