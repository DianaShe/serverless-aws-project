const funcWrapper = handlerFuction => {
    const func = async (event) => {
        try {
            return await handlerFuction(event)
        } catch (error) {
            if (error.status !== "500") {
                return {
                    statusCode: error.status,
                    body: JSON.stringify({ message: error.message }),
                  };
            } 
            return {
                statusCode: 500,
                body: JSON.stringify({ message: error.message }),
              };
            
        }
    }
    return func
}

module.exports = funcWrapper