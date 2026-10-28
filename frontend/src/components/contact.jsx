import { Fragment } from 'react';
import Icon from './Icon.jsx';
import { SITE, telHref, waHref } from '../config/site.js';

// Both admissions numbers as call or WhatsApp links, separated by " / "
export function PhoneLinks({ whatsapp = false }) {
  return SITE.phones.map((phone, i) => (
    <Fragment key={phone}>
      {i > 0 && ' / '}
      {whatsapp
        ? <a href={waHref(phone)} target="_blank" rel="noopener">{phone}</a>
        : <a href={telHref(phone)}>{phone}</a>}
    </Fragment>
  ));
}

export function ContactList() {
  return (
    <ul className="contact-list">
      <li>
        <span className="icon-badge"><Icon name="pin" /></span>
        <div><strong>Visit us</strong><span>{SITE.address.join(', ')}</span></div>
      </li>
      <li>
        <span className="icon-badge"><Icon name="phone" /></span>
        <div><strong>Call us</strong><span><PhoneLinks /></span></div>
      </li>
      <li>
        <span className="icon-badge"><Icon name="whatsapp" /></span>
        <div><strong>WhatsApp</strong><span><PhoneLinks whatsapp /></span></div>
      </li>
      {SITE.email && (
        <li>
          <span className="icon-badge"><Icon name="mail" /></span>
          <div><strong>Email</strong><span><a href={`mailto:${SITE.email}`}>{SITE.email}</a></span></div>
        </li>
      )}
    </ul>
  );
}

export function WhatsAppBox() {
  return (
    <div className="whatsapp">
      <Icon name="whatsapp" />
      <div>
        <span>WhatsApp admissions</span>
        <strong><PhoneLinks whatsapp /></strong>
      </div>
    </div>
  );
}
