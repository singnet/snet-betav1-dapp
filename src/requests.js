
export class configrequests{
    static applyTovoteconfigrequests(useraddress)
        {
          const configvoterequests ={
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },  
              method: 'POST',
              body: JSON.stringify({
                user_address: useraddress
              })
        }
        return configvoterequests
      }

      static applyToonvoteconfigrequests(useraddress,orgid,serviceid,upvote,downvote)
      {

      
        const configonvoterequests =
        {
          'mode': 'cors',
          headers: {
            "Content-Type": "application/json",
          },
          method: 'POST',
          body: JSON.stringify(
           { vote:{
            user_address: useraddress,
            org_id:orgid,
            service_id:serviceid,
            up_vote:upvote,
            down_vote:downvote
          }})
        }

        return configonvoterequests
      }

}

export async function postApi(url,settings){
   
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
  