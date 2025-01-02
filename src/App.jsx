// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import { useEffect, useState } from 'react';
import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import DefaultLayout from './layout/DefaultLayout';
import Home from './pages/Home';
import Student from './pages/Student';
import AddStudent from './pages/AddStudent';
import UpdateStudent from './pages/UpdateStudent';
import { useForm, FormProvider } from "react-hook-form"
function App() {
  const [loading, setLoading] = useState(true);
  const methods = useForm()
  // const { pathname } = useLocation();

  // useEffect(() => {
  //   window.scrollTo(0, 0);
  // }, [pathname]);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  return loading ? (
    <p>Loading...</p>
  ) : (
    <FormProvider {...methods}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<DefaultLayout />}>
            <Route index element={<Home pageTitle={"Home"} />} />
            <Route path="student">
              <Route index element={<Student pageTitle={"Student"} />} />
              <Route path="add_students" element={<AddStudent pageTitle={"Add Student"} />} />
              <Route path="update_student" element={<UpdateStudent pageTitle={"Update Student"} />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </FormProvider>
  );
}

export default App
