import "./Home.css"
import doctor from "./assets/doctor_color.svg"
import patient from "./assets/patient_color.svg"
const Home = () => {
  return (
    <>
        <div className="container">
            <h1>Who You Are?</h1>
            
            <div className="btns">
                <button id="Patient">
                    <img src={patient} alt=""  width={350} height={250}/>
                    Login as Patient
                </button>
                <button id="Doctor">
                    <img src={doctor} alt="" width={350} height={250}/>
                    Login as Assistant
                </button>
            </div>
        </div>
    </>
  );
};

export default Home;