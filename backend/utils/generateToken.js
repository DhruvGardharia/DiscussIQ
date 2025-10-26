import jwt from 'jsonwebtoken';

const generateToken=(user,res)=>{
    const token=jwt.sign({id:user._id,email:user.email},process.env.JWT_SEC,{
        expiresIn : "15d",
    });

    res.cookie("token",token,{
        maxAge : 15*24*60*60*1000,
        httpOnly:true,
        // For development we keep SameSite loose; in production tighten this and use secure cookies
        sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    });
    return token;
};

export default generateToken;