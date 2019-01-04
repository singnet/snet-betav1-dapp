export async function postApi(url,useraddress){
    const settings = 
    { 
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    },  
      method: 'POST',
      body: JSON.stringify({
        user_address: useraddress
      })
    }
    try{
          const data = await fetch(url, settings)
          .then(response => response.json())
          .then(json => {
              return json;
          })
          .catch(err => {
              return err
          });
          return data
  
    }
    catch(err)
    {
     console.log(err)
    }
  }
  export async function getApi (url) {
    try{
      // wait for a response
      // after response it will assign it to the variable 'resp' and continue
           const resp = await fetch(url)
      // only run if response has been asssigned
           const data = await resp.json() 
        
      // this code only runs when data is assigned.
      
           return data
           
         } catch (err) {
              console.log(err)
           }
      }
  