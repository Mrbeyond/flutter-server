const recoveryOTP=(email, accName, OTP)=>{
  return{
    to: email,
    from: "beyondbeyond602@gmail.com",
    subject: "Reset your password",
    text: "From beyond",
    html: `<html>
      <body>
        <h1>Hey, ${accName} </h1>
        <div>
          A password recovery attempt requires usage of one time password sent to you. 
          Plaese use the OTP code below and note that it is only valid for the next 10 minutes.
        </div>
        <div>
          Verification code: <srong>${OTP}</strong>
          <br />
          Validity: 10 minutes

        </div>
        <br />
        <div>Thanks, Beyond</div>
      </body>
    </html>`
  }  
}

const buttonStyle= "background: #4285F4; padding: 10px 20px; border-radius: 10px; "+
"text-style: none; font-weight: bold; color: #fff";

const confirmEmail=(email,accName, OTP)=>{
  return{
    to: email,
    from: "beyondbeyond602@gmail.com",
    subject: "Verify your Beyond acoount",
    text: "From beyond",
    html: `<html>
      <body>
        <h1>Hey, ${accName} </h1>
        <h3>Account verification </h3>
        <div>
          Thank your for choosing Beyond! Please confirm your email address by 
          providing the OTP below in the Email corfimation interface. An up-to-date email address is required to 
          notify you about necessary updates on your account with us. 
        </div>
        <br /> <br />

        <div>
          Verification code: <srong>${OTP}</strong>
        </div>
        <br />
        <div>Thanks, Beyond</div>
      </body>
    </html>`
  }  
}

module.exports ={
  confirmEmail,
  recoveryOTP,
}
