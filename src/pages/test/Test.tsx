import AddStudentForm from "@/components/AddStudentForm";
import AddUserForm from "@/components/AddUserForm";

const Test = () => {
  return (
    <div className="w-full h-screen flex justify-content-center align-items-center">
      <AddUserForm />
      <AddStudentForm disabled={false} />
    </div>
  );
};

export default Test;
