import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import FormInput from '../components/FormInput';
import PageHeader from '../components/PageHeader';
import { useAppData } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import customersService from '../services/customersService';
import { validateCustomer } from '../utils/validators';

function CustomerFormPage() {
  const navigate = useNavigate();
  const { fetchCustomers } = useAppData();
  const { notify } = useToast();
  const [values, setValues] = useState({ full_name: '', email: '', phone_number: '' });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const updateField = (field, value) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: '' }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validateCustomer(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSaving(true);
    try {
      await customersService.create({
        full_name: values.full_name.trim(),
        email: values.email.trim(),
        phone_number: values.phone_number.trim(),
      });
      await fetchCustomers({ force: true });
      notify('Customer created successfully.');
      navigate('/customers');
    } catch (error) {
      notify(error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader title="New Customer" description="Create a customer contact record." />
      <form className="form-card" onSubmit={handleSubmit}>
        <FormInput label="Full Name" id="full_name" value={values.full_name} onChange={(event) => updateField('full_name', event.target.value)} error={errors.full_name} />
        <FormInput label="Email" id="email" type="email" value={values.email} onChange={(event) => updateField('email', event.target.value)} error={errors.email} />
        <FormInput label="Phone Number" id="phone_number" value={values.phone_number} onChange={(event) => updateField('phone_number', event.target.value)} error={errors.phone_number} />
        <div className="form-actions">
          <Link className="btn btn-secondary" to="/customers">Cancel</Link>
          <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Customer'}</button>
        </div>
      </form>
    </>
  );
}

export default CustomerFormPage;
