 const responseData = async () => {
      try {
        const payload ={
    user: {
        email_or_ghin: email,
        password: ghinPassword
    },
    token: "123"
}

        const response = await axios.post("https://api.example.com/users", payload);
        console.log(response.data); // server response
        return response.data;
      }
      catch (err) {
        console.error(err);
        return { error: "Failed to post data" };
      }
    };

    const ghinData=responseData.