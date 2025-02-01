import  {Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Code from './components/Code';


function App() {
  return (
    <>
    <Routes>
      <Route path='/' element={<Home/>}/>
      <Route path='/code' element={<Code/>}/>
    </Routes>
    </>
  )
}

export default App;
