import { ref } from "vue";

import { useRouter } from "vue-router";
import { useMutation } from "@tanstack/vue-query";
import { useAuth } from "@/modules/auth/composables/useAuth";
import { api } from "@/core/composables/useApi";

const getForm = () => ({
  email: "",
  password: "",
  errorMsg: "",
});

export const useLogin = () => {
  const form = ref(getForm());
  const router = useRouter();
  
  const { setToken , setUser} = useAuth();

  const { isPending, mutate: loginMutate } = useMutation({
    mutationFn: async () => {
      const { data } = await api.post(
        `${import.meta.env.VITE_BACKEND_URL}/login`,
        {
          email: form.value.email,
          password: form.value.password,
        },
      );
      return data;
    },
    onSuccess: (data) => {
      setToken(data.token);
      setUser(data.user);
      router.push("/dashboard");
    },
    onError: (err: any) => {
      form.value.errorMsg =
        err.response?.data?.message || "Error en inicio de sesión";
    },
  });

  const onLogin = () => {
    loginMutate();
  };

  return {
    form,
    onLogin,

    isPending,
  };
};
