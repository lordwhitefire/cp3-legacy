import React, { useEffect, useRef } from "react";
import data from "@/data/data.json";

const modal = data.modals;

export function Modals() {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = modalRef.current;
    if (!el) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        const closeBtn = el.querySelector<HTMLElement>('[data-dismiss="modal"]');
        closeBtn?.click();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  return (
      <div ref={modalRef} className="modal fade" id="modal-login-register" tabIndex={-1} role="dialog">
        <div className="modal-dialog modal-lg modal--login" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">
                  ×
                </span>
              </button>
            </div>
            <div className="modal-body">
              <div className="modal-account-holder">
                <div className="modal-account__item">
                  <form action={data.site.url} className="modal-form">
                    <h5>
                      {modal.register.title}
                    </h5>
                    {modal.register.fields.map((field, i) => (
                      <div key={i} className="form-group">
                        <input type={field.type} className="form-control" placeholder={field.placeholder} />
                      </div>
                    ))}
                    <div className="form-group form-group--submit">
                      <a href={modal.register.button.url} className="btn btn-primary btn-block" onClick={(e) => e.preventDefault()}>
                        {modal.register.button.text}
                      </a>
                    </div>
                    <div className="modal-form--note">
                      {modal.register.note}
                    </div>
                  </form>
                </div>
                <div className="modal-account__item">
                  <form action={data.site.url} className="modal-form">
                    <h5>
                      {modal.login.title}
                    </h5>
                    {modal.login.fields.map((field, i) => (
                      <div key={i} className="form-group">
                        <input type={field.type} className="form-control" placeholder={field.placeholder} />
                      </div>
                    ))}
                    <div className="form-group form-group--pass-reminder">
                      <label className="checkbox checkbox-inline">
                        <input type="checkbox" id="inlineCheckbox1" value="option1" checked />
                        {" "}
                        Remember Me
                        {" "}
                        <span className="checkbox-indicator"></span>
                      </label>
                      {" "}
                      <a href={modal.login.forgotPassword.url} onClick={(e) => e.preventDefault()}>
                        Forgot your password?
                      </a>
                    </div>
                    <div className="form-group form-group--submit">
                      <a href={modal.login.button.url} className="btn btn-primary-inverse btn-block" onClick={(e) => e.preventDefault()}>
                        {modal.login.button.text}
                      </a>
                    </div>
                    <div className="modal-form--social">
                      <h6>
                        {modal.login.socialLogin.heading}
                      </h6>
                      <ul className="social-links social-links--btn text-center">
                        {modal.login.socialLogin.buttons.map((btn, i) => (
                          <li key={i} className="social-links__item">
                            <a href={btn.url} className={`social-links__link social-links__link--lg social-links__link--${btn.platform === "Facebook" ? "fb" : btn.platform.toLowerCase()}`} onClick={(e) => e.preventDefault()}>
                              <i className={btn.icon}></i>
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}
