const emailNotification = (linkIds) => {
    const links = linkIds
      .map((linkId) => `${process.env.BASE}/${linkId}`)
      .join("<br>");
  
    return `
      <html>
        <head>
             <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f0f0f0;
              padding: 20px;
            }
            
            
          </style>
        </head>
        <body>
          <h1>Short Linker Expiration Notification</h1>
            <p>Dear user,</p>
            <p>We inform you that following links are no longer accessible:</p>
            <p>${links}</p>
            <p>In order to create new short links, visit our ShortLink service.</p>
            <p>Thank you for using Shortlinker!</p>
          </div>
        </body>
      </html>
    `;
  };

module.exports = emailNotification