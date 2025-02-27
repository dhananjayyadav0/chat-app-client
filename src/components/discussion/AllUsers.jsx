import React from "react";
import { X, Loader2, User } from "lucide-react";
import useFetchData from "../../hooks/global-hooks/useFetchData";

const AllUsers = ({ onClose, onUserSelect }) => {
  const { data: users, loading, error } = useFetchData("/api/chat/all-users");

  const handleUserSelect = (user) => {
    if (onUserSelect) {
      onUserSelect(user);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-lg mx-auto shadow-xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-indigo-600 text-white p-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">All Users</h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-indigo-700 p-2 rounded-full transition duration-200"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto flex-1 max-h-[60vh] sm:max-h-[70vh]">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 size={24} className="animate-spin text-indigo-600" />
            </div>
          ) : error ? (
            <div className="text-red-500 text-center p-4">{error}</div>
          ) : users.length > 0 ? (
            <div className="space-y-3">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer transition-all flex items-center gap-3"
                  onClick={() => handleUserSelect(user)}
                >
                  <div className="bg-indigo-100 p-2 rounded-full">
                    <User size={20} className="text-indigo-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">
                      {user.username}
                    </div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 p-4">No users found</div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full py-2 bg-gray-200 hover:bg-gray-300 rounded-md transition-all font-medium text-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AllUsers;
