export class Requests {

	static getPostBody(requestObject) {
		const body = {
			'mode': 'cors',
			headers: {
				"Content-Type": "application/json",
			},
			method: 'POST',
			body: JSON.stringify(requestObject)
		}
		return body
	}

	static async post(url, requestObject) {
		try {
			const data = await fetch(url, Requests.getPostBody(requestObject))
				.then(response => response.json())
				.then(json => {
					return json;
				})
				.catch(err => {
					return err
				});
			return data
		} catch (err) {
			console.log(err)
		}
	}

	static async get(url) {
		try {
			const resp = await fetch(url)
			const data = await resp.json()
			return data
		} catch (err) {
			console.log(err)
		}
	}	
}