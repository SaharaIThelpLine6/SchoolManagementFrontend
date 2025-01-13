// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import { useEffect, useState } from 'react';
import './App.css'
import { BrowserRouter, Form, Route, Routes } from 'react-router-dom';
import DefaultLayout from './layout/DefaultLayout';
import Home from './pages/Home';
import Student from './pages/Student';
import AddStudent from './pages/AddStudent';
import UpdateStudent from './pages/UpdateStudent';
import { useForm, FormProvider } from "react-hook-form"
import Login from './pages/Login';
import Users from './pages/Users';
import Class from './pages/Class';
import FormP from './pages/FormP';
import BookList from './pages/BookList';
import GroupDistribution from './pages/GroupDistribution';
import Section from './pages/Section';
import Student_Section from './pages/Section';
import TeacherInfo from './pages/TeacherInfo';
import PayRole from './pages/PayRole';
import PayRoleName from './pages/PayRoleName';
import Report from './pages/Report';
import Query from './pages/Query';
import { ToastContainer } from 'react-toastify';
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
              <Route path="booklist" element={<BookList pageTitle={"Book List"} />} />
              <Route path="groupdistribution" element={<GroupDistribution pageTitle={"Students Group"} />} />
              <Route path="class" element={<Class />} pageTitle={"Class"} />
              <Route path="section" element={<Section />} pageTitle={"Section"} />
            </Route>
            <Route path="users">
              <Route index element={<Users pageTitle={"Staff"} />} />
              <Route path="teacherInfo" element={<TeacherInfo pageTitle={"Teacher Info"} />} />
              <Route path="payRole" element={<PayRole pageTitle={"Pay Role"} />} />
              <Route path="pRName" element={<PayRoleName pageTitle={"Pay Role Name"} />} />
              <Route path="report" element={<Report pageTitle={"Reports"} />} />
            </Route>
            <Route path="/formp" element={<FormP />} />
            <Route path='/query' element={<Query />} />
          </Route>
          <Route path="/login" element={<Login />} />
        </Routes>
      </BrowserRouter>
      <ToastContainer autoClose={8000} />
    </FormProvider>
  );
}

export default App
