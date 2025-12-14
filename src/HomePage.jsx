import "./HomePage.css"
const HomePage = () => {
  let name;
  const handleChangeName=(e)=>{
    name=e.target.value;
  }
  return (
    <form>
      <label htmlFor="name">Name:</label>
      <input value={name} onChange={(e)=>handleChangeName} id="name" type="text" />
      <br />

      <label htmlFor="password">Password:</label>
      <input id="password" type="password" />
      <br />

      <label htmlFor="contact">Contact:</label>
      <input id="contact" type="number" />
    </form>
  );
};

export default HomePage;
