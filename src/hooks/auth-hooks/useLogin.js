import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { loginUser } from "../../components/services/authApi";

const useLogin = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from || "/discussion";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);

    try {
      const response = await loginUser(formData);
      if (response.data.success) {
        dispatch({ type: "login", token: response.data.data.token });
        dispatch({ type: "userType", userType: "user" });

        toast.success(response.data.message || "Login successful!");
        navigate(from, { replace: true });
      } else {
        toast.error(response.data.message || "Login failed. Please try again.");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Login failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return { formData, isLoading, handleChange, handleSubmit };
};

export default useLogin;
