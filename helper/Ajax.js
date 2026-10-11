async function GetData(fun) {
  try {
    let response;
    try {
      response = await fetch("../data/users.json");
      if (!response.ok) throw new Error("Fallback to root");
    } catch {
      response = await fetch("data/users.json");
    }
    let data = await response.json();
    fun(data);
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

export default GetData;
