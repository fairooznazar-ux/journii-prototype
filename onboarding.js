/**
 * Journii first-launch onboarding — ends at Stay tab.
 * Set localStorage journii_onboarded only after Club dismiss or payment success.
 */
(function journiiOnboarding() {
  const STORAGE_KEY = "journii_onboarded";
  const phone = document.querySelector(".phone");
  const root = document.getElementById("journii-onboarding");
  if (!phone || !root) return;

  if (localStorage.getItem(STORAGE_KEY) === "true") return;

  const authLayer = root.querySelector(".onb-auth");
  const clubLayer = root.querySelector(".onb-club");
  const paymentLayer = root.querySelector(".onb-payment");
  const successLayer = root.querySelector(".onb-success");
  const panels = {
    phone: root.querySelector('[data-onb-panel="phone"]'),
    otp: root.querySelector('[data-onb-panel="otp"]'),
  };
  const phoneInput = root.querySelector("#onb-phone-input");
  const phoneArrows = root.querySelectorAll(".onb-phone-arrow");
  const otpHidden = root.querySelector("#onb-otp-hidden");
  const otpBoxes = Array.from(root.querySelectorAll(".onb-otp-box"));
  const otpArrow = root.querySelector("#onb-otp-arrow");
  const otpPhoneLabel = root.querySelector("#onb-otp-phone");
  const otpEdit = root.querySelector("#onb-otp-edit");
  const kbKeys = root.querySelectorAll(".onb-kb-key");

  let authStep = 1;
  let phoneDigits = "";
  let otpDigits = "";

  phone.classList.add("is-onboarding-active");
  root.hidden = false;
  root.removeAttribute("aria-hidden");
  showLayer(authLayer);

  function formatPhone(d) {
    if (d.length <= 5) return d;
    return `${d.slice(0, 5)} ${d.slice(5)}`;
  }

  function setAuthStep(step) {
    authStep = step;
    Object.values(panels).forEach((p) => p?.classList.remove("is-active"));
    authLayer.classList.toggle("is-keyboard-open", step === 2 || step === 3);
    if (step === 1 || step === 2) panels.phone?.classList.add("is-active");
    if (step === 3) {
      panels.otp?.classList.add("is-active");
      if (otpPhoneLabel) otpPhoneLabel.textContent = `+91 ${formatPhone(phoneDigits)}`;
      otpDigits = "";
      updateOtpBoxes();
      otpArrow.disabled = true;
      window.setTimeout(() => otpHidden?.focus(), 120);
    }
    if (step === 1 || step === 2) {
      phoneInput.value = phoneDigits;
      updatePhoneArrow();
      if (step === 2) window.setTimeout(() => phoneInput?.focus(), 150);
    }
  }

  function updatePhoneArrow() {
    const valid = /^\d{10}$/.test(phoneDigits);
    phoneArrows.forEach((btn) => {
      btn.disabled = !valid;
    });
  }

  function updateOtpBoxes() {
    otpBoxes.forEach((box, i) => {
      box.textContent = otpDigits[i] || "";
      box.classList.toggle("is-active", i === otpDigits.length && otpDigits.length < 4);
    });
    otpArrow.disabled = otpDigits.length !== 4;
  }

  function showLayer(layer) {
    [authLayer, clubLayer, paymentLayer, successLayer].forEach((el) => {
      if (!el) return;
      el.classList.toggle("is-active", el === layer);
    });
  }

  function transitionToLayer(layer) {
    showLayer(layer);
  }

  function markOnboardedAndExit() {
    localStorage.setItem(STORAGE_KEY, "true");
    root.classList.add("is-exiting");
    phone.classList.remove("is-onboarding-active");
    phone.classList.add("is-onboarding-reveal");
    window.setTimeout(() => {
      root.hidden = true;
      root.setAttribute("aria-hidden", "true");
      phone.classList.add("is-onboarding-done");
      window.setTimeout(() => {
        phone.classList.remove("is-onboarding-reveal", "is-onboarding-done");
        root.remove();
      }, 450);
    }, 200);
  }

  phoneInput?.addEventListener("input", () => {
    phoneDigits = phoneInput.value.replace(/\D/g, "").slice(0, 10);
    phoneInput.value = phoneDigits;
    updatePhoneArrow();
  });

  phoneArrows.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!/^\d{10}$/.test(phoneDigits)) return;
      if (authStep === 1) setAuthStep(2);
      else if (authStep === 2) setAuthStep(3);
    });
  });

  otpHidden?.addEventListener("input", () => {
    otpDigits = otpHidden.value.replace(/\D/g, "").slice(0, 4);
    otpHidden.value = otpDigits;
    updateOtpBoxes();
  });

  otpHidden?.addEventListener("focus", () => {
    otpBoxes.forEach((box, i) => {
      box.classList.toggle("is-active", i === otpDigits.length && otpDigits.length < 4);
    });
  });

  otpArrow?.addEventListener("click", () => {
    if (otpDigits.length !== 4) return;
    transitionToLayer(clubLayer);
    authLayer.classList.remove("is-keyboard-open");
  });

  otpEdit?.addEventListener("click", () => {
    otpHidden?.blur();
    setAuthStep(1);
    window.setTimeout(() => phoneInput?.focus(), 100);
  });

  otpBoxes.forEach((box) => {
    box.addEventListener("click", () => otpHidden?.focus());
  });
  root.querySelector(".onb-otp-boxes")?.addEventListener("click", () => otpHidden?.focus());

  kbKeys.forEach((key) => {
    key.addEventListener("click", () => {
      const action = key.dataset.action;
      const digit = key.dataset.digit;
      const target = authStep === 3 ? otpHidden : phoneInput;
      if (!target) return;

      if (action === "back") {
        if (authStep === 3) {
          otpDigits = otpDigits.slice(0, -1);
          otpHidden.value = otpDigits;
          updateOtpBoxes();
        } else {
          phoneDigits = phoneDigits.slice(0, -1);
          phoneInput.value = phoneDigits;
          updatePhoneArrow();
        }
        return;
      }
      if (action === "done") {
        target.blur();
        return;
      }
      if (!digit) return;

      if (authStep === 3) {
        if (otpDigits.length >= 4) return;
        otpDigits += digit;
        otpHidden.value = otpDigits;
        updateOtpBoxes();
        if (otpDigits.length === 4) otpArrow.disabled = false;
      } else {
        if (phoneDigits.length >= 10) return;
        phoneDigits += digit;
        phoneInput.value = phoneDigits;
        updatePhoneArrow();
      }
    });
  });

  root.querySelector("#onb-club-close")?.addEventListener("click", markOnboardedAndExit);
  root.querySelector("#onb-club-join")?.addEventListener("click", () => transitionToLayer(paymentLayer));
  root.querySelector("#onb-pay-back")?.addEventListener("click", () => transitionToLayer(clubLayer));
  root.querySelector("#onb-pay-submit")?.addEventListener("click", () => {
    transitionToLayer(successLayer);
    const check = root.querySelector(".onb-check-wrap");
    if (check) {
      check.style.animation = "none";
      void check.offsetWidth;
      check.style.animation = "";
    }
  });
  root.querySelector("#onb-success-go")?.addEventListener("click", markOnboardedAndExit);

  setAuthStep(1);
})();
