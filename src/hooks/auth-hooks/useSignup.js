import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { loginUser, registerUser } from "../../components/services/authApi";

const useSignup = (switchToLogin) => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    let newErrors = {};
    if (!formData.username) newErrors.username = "Username is required.";
    if (!formData.email) newErrors.email = "Email is required.";
    if (!formData.password) newErrors.password = "Password is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const registerResponse = await registerUser(formData);
      if (registerResponse.data.success) {
        const loginResponse = await loginUser({
          email: formData.email,
          password: formData.password,
        });

        if (loginResponse.data.success) {
          dispatch({ type: "LOGIN", payload: loginResponse.data.data.token });
          dispatch({ type: "SET_USER_TYPE", payload: "user" });

          toast.success("Account created successfully!");
          navigate("/home", { replace: true });
        } else {
          toast.success("Account created successfully! Please log in.");
          switchToLogin();
        }
      } else {
        toast.error(registerResponse.data.message || "Registration failed.");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return { formData, handleChange, handleSubmit, isLoading, errors };
};

export default useSignup;
