import React, { useState } from 'react';
import { AuthModalState, User, UserType, AdminRole, Grade } from '../../types';

interface AuthModalProps {
    modalState: AuthModalState;
    onClose: () => void;
    onLoginSuccess: (user: User) => void;
    onRegister: (newUser: Omit<User, 'id'>) => void;
    approvedUsers: User[];
}

// Hardcoded secret values as per requirements
const SCHOOL_MASTER_CODE = 'QMPS-512&786';
const PRINCIPAL_NUMBER = '923555371125';
const MOCK_PRINCIPAL_FULL_NAME = 'Principal QMPS';
const MOCK_PRINCIPAL_EMAIL = 'principalqmps@gmail.com';
const MOCK_PRINCIPAL_PASSWORD = 'principal512@512';

const AuthModal: React.FC<AuthModalProps> = ({ modalState, onClose, onLoginSuccess, onRegister, approvedUsers }) => {
    const [formData, setFormData] = useState<any>({ grade: Grade.PlayGroup });
    const [error, setError] = useState<string>('');
    const [adminRole, setAdminRole] = useState<AdminRole>('staff');
    
    const { mode, userType } = modalState;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (mode === 'register') {
            if (formData.password !== formData.confirmPassword) {
                setError("Passwords do not match.");
                return;
            }
            
            const newUser: Omit<User, 'id'> = {
                fullName: formData.fullName,
                email: formData.email,
                password: formData.password,
                userType: userType as UserType,
                grade: userType === 'student' ? formData.grade : undefined,
                childStudentIds: userType === 'parent' ? formData.childStudentIds.split(',').map((s: string) => s.trim()) : undefined,
            };
            onRegister(newUser);
        } else { // Login mode
            if (userType === 'admin') {
                if (adminRole === 'principal') {
                    if (formData.fullName === MOCK_PRINCIPAL_FULL_NAME &&
                        formData.email === MOCK_PRINCIPAL_EMAIL &&
                        formData.password === MOCK_PRINCIPAL_PASSWORD &&
                        formData.schoolMasterCode === SCHOOL_MASTER_CODE &&
                        formData.principalNumber === PRINCIPAL_NUMBER) {
                        onLoginSuccess({ id: 'principal-01', fullName: MOCK_PRINCIPAL_FULL_NAME, email: MOCK_PRINCIPAL_EMAIL, userType: 'principal' });
                    } else {
                        setError('Invalid Principal credentials.');
                    }
                } else { // staff login
                    const user = approvedUsers.find(u => u.userType === 'admin' && u.email === formData.email && u.password === formData.password);
                    if (user && formData.schoolMasterCode === SCHOOL_MASTER_CODE) {
                        onLoginSuccess(user);
                    } else {
                        setError('Invalid credentials or account not approved.');
                    }
                }
            } else if (userType === 'parent') { // Parent login
                 const user = approvedUsers.find(u =>
                    u.userType === 'parent' &&
                    u.email === formData.email &&
                    u.password === formData.password
                );
                if (user) {
                    onLoginSuccess(user);
                } else {
                    setError('Invalid credentials or account not approved.');
                }
            }
            else { // Student login
                const user = approvedUsers.find(u =>
                    u.userType === 'student' &&
                    u.email === formData.email &&
                    u.studentId === formData.studentId &&
                    u.password === formData.password
                );
                if (user) {
                    onLoginSuccess(user);
                } else {
                    setError('Invalid credentials or account not approved.');
                }
            }
        }
    };
    
    const renderTitle = () => {
        const action = mode === 'login' ? 'Login' : 'Register';
        let role = userType.charAt(0).toUpperCase() + userType.slice(1);
        if (userType === 'admin') role = 'Admin/Staff';
        return `${action} as ${role}`;
    };

    const renderFormFields = () => {
        const isRegister = mode === 'register';
        
        if (userType === 'student') {
            return (
                <>
                    {isRegister && <input name="fullName" placeholder="Full Name" onChange={handleInputChange} required className="input-field" />}
                    <input name="email" type="email" placeholder="Email Address" onChange={handleInputChange} required className="input-field" />
                    {!isRegister && <input name="studentId" placeholder="Student ID" onChange={handleInputChange} required className="input-field" /> }
                    {isRegister && (
                        <select name="grade" value={formData.grade} onChange={handleInputChange} required className="input-field">
                            {Object.values(Grade).map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                    )}
                    <input name="password" type="password" placeholder="Password" onChange={handleInputChange} required className="input-field" />
                    {isRegister && <input name="confirmPassword" type="password" placeholder="Confirm Password" onChange={handleInputChange} required className="input-field" />}
                    {isRegister && <p className="text-xs text-gray-500 text-center">Your Student ID will be sent to you after the principal approves your registration.</p>}
                </>
            );
        }

        if (userType === 'parent') {
             return (
                <>
                    {isRegister && <input name="fullName" placeholder="Full Name" onChange={handleInputChange} required className="input-field" />}
                    <input name="email" type="email" placeholder="Email Address" onChange={handleInputChange} required className="input-field" />
                    <input name="password" type="password" placeholder="Password" onChange={handleInputChange} required className="input-field" />
                    {isRegister && <input name="confirmPassword" type="password" placeholder="Confirm Password" onChange={handleInputChange} required className="input-field" />}
                    {isRegister && <input name="childStudentIds" placeholder="Your Child's Student ID(s), comma-separated" onChange={handleInputChange} required className="input-field" />}
                </>
            );
        }

        if (userType === 'admin') {
            if (isRegister) { // Admin/Staff Registration
                return (
                    <>
                        <p className="text-sm text-gray-600 mb-4">Staff registration requires principal approval after submission.</p>
                        <input name="fullName" placeholder="Full Name" onChange={handleInputChange} required className="input-field" />
                        <input name="email" type="email" placeholder="Email Address" onChange={handleInputChange} required className="input-field" />
                        <input name="password" type="password" placeholder="Password" onChange={handleInputChange} required className="input-field" />
                        <input name="confirmPassword" type="password" placeholder="Confirm Password" onChange={handleInputChange} required className="input-field" />
                    </>
                );
            } else { // Admin Login
                return (
                    <>
                        <select name="adminRole" value={adminRole} onChange={(e) => setAdminRole(e.target.value as AdminRole)} className="input-field">
                            <option value="staff">Staff</option>
                            <option value="principal">Principal</option>
                        </select>

                        {adminRole === 'principal' ? (
                            <>
                                <input name="fullName" placeholder="Full Name" onChange={handleInputChange} required className="input-field" />
                                <input name="email" type="email" placeholder="Email Address" onChange={handleInputChange} required className="input-field" />
                                <input name="password" type="password" placeholder="Password" onChange={handleInputChange} required className="input-field" />
                                <input name="principalNumber" placeholder="Principal Number" onChange={handleInputChange} required className="input-field" />
                                <input name="schoolMasterCode" placeholder="School Master Code" onChange={handleInputChange} required className="input-field" />
                            </>
                        ) : (
                            <>
                                <input name="email" type="email" placeholder="Email Address" onChange={handleInputChange} required className="input-field" />
                                <input name="password" type="password" placeholder="Password" onChange={handleInputChange} required className="input-field" />
                                <input name="schoolMasterCode" placeholder="School Master Code" onChange={handleInputChange} required className="input-field" />
                            </>
                        )}
                    </>
                );
            }
        }
        return null;
    };
    
    // Do not show register option for principal
    if (userType === 'admin' && adminRole === 'principal' && mode === 'register') return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose} role="dialog" aria-modal="true">
            <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-school-blue">{renderTitle()}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-3xl leading-none" aria-label="Close dialog">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <style>{`.input-field { width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px; }`}</style>
                    {renderFormFields()}
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <button type="submit" className="w-full bg-school-blue text-white py-2 px-4 rounded-lg hover:bg-opacity-90 transition-colors">
                        {mode === 'login' ? 'Login' : 'Register'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AuthModal;