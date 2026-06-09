// node_modules/@biowasm/aioli/dist/aioli.mjs
var r = Symbol("Comlink.proxy");
var H = Symbol("Comlink.endpoint");
var g = Symbol("Comlink.releaseProxy");
var o = Symbol("Comlink.thrown");
var Y = (l) => typeof l == "object" && l !== null || typeof l == "function";
var k = {
  canHandle: (l) => Y(l) && l[r],
  serialize(l) {
    const { port1: c, port2: b } = new MessageChannel();
    return R(l, c), [b, [b]];
  },
  deserialize(l) {
    return l.start(), I(l);
  }
};
var x = {
  canHandle: (l) => Y(l) && o in l,
  serialize({ value: l }) {
    let c;
    return l instanceof Error ? c = {
      isError: true,
      value: {
        message: l.message,
        name: l.name,
        stack: l.stack
      }
    } : c = { isError: false, value: l }, [c, []];
  },
  deserialize(l) {
    throw l.isError ? Object.assign(new Error(l.value.message), l.value) : l.value;
  }
};
var S = /* @__PURE__ */ new Map([
  ["proxy", k],
  ["throw", x]
]);
function R(l, c = self) {
  c.addEventListener("message", function b(t) {
    if (!t || !t.data)
      return;
    const { id: i, type: e, path: m } = Object.assign({ path: [] }, t.data), d = (t.data.argumentList || []).map(u);
    let Z;
    try {
      const n = m.slice(0, -1).reduce((s, p) => s[p], l), a = m.reduce((s, p) => s[p], l);
      switch (e) {
        case "GET":
          Z = a;
          break;
        case "SET":
          n[m.slice(-1)[0]] = u(t.data.value), Z = true;
          break;
        case "APPLY":
          Z = a.apply(n, d);
          break;
        case "CONSTRUCT":
          {
            const s = new a(...d);
            Z = U(s);
          }
          break;
        case "ENDPOINT":
          {
            const { port1: s, port2: p } = new MessageChannel();
            R(l, p), Z = J(s, [s]);
          }
          break;
        case "RELEASE":
          Z = void 0;
          break;
        default:
          return;
      }
    } catch (n) {
      Z = { value: n, [o]: 0 };
    }
    Promise.resolve(Z).catch((n) => ({ value: n, [o]: 0 })).then((n) => {
      const [a, s] = y(n);
      c.postMessage(Object.assign(Object.assign({}, a), { id: i }), s), e === "RELEASE" && (c.removeEventListener("message", b), V(c));
    });
  }), c.start && c.start();
}
function N(l) {
  return l.constructor.name === "MessagePort";
}
function V(l) {
  N(l) && l.close();
}
function I(l, c) {
  return X(l, [], c);
}
function W(l) {
  if (l)
    throw new Error("Proxy has been released and is not useable");
}
function X(l, c = [], b = function() {
}) {
  let t = false;
  const i = new Proxy(b, {
    get(e, m) {
      if (W(t), m === g)
        return () => G(l, {
          type: "RELEASE",
          path: c.map((d) => d.toString())
        }).then(() => {
          V(l), t = true;
        });
      if (m === "then") {
        if (c.length === 0)
          return { then: () => i };
        const d = G(l, {
          type: "GET",
          path: c.map((Z) => Z.toString())
        }).then(u);
        return d.then.bind(d);
      }
      return X(l, [...c, m]);
    },
    set(e, m, d) {
      W(t);
      const [Z, n] = y(d);
      return G(l, {
        type: "SET",
        path: [...c, m].map((a) => a.toString()),
        value: Z
      }, n).then(u);
    },
    apply(e, m, d) {
      W(t);
      const Z = c[c.length - 1];
      if (Z === H)
        return G(l, {
          type: "ENDPOINT"
        }).then(u);
      if (Z === "bind")
        return X(l, c.slice(0, -1));
      const [n, a] = h(d);
      return G(l, {
        type: "APPLY",
        path: c.map((s) => s.toString()),
        argumentList: n
      }, a).then(u);
    },
    construct(e, m) {
      W(t);
      const [d, Z] = h(m);
      return G(l, {
        type: "CONSTRUCT",
        path: c.map((n) => n.toString()),
        argumentList: d
      }, Z).then(u);
    }
  });
  return i;
}
function T(l) {
  return Array.prototype.concat.apply([], l);
}
function h(l) {
  const c = l.map(y);
  return [c.map((b) => b[0]), T(c.map((b) => b[1]))];
}
var K = /* @__PURE__ */ new WeakMap();
function J(l, c) {
  return K.set(l, c), l;
}
function U(l) {
  return Object.assign(l, { [r]: true });
}
function y(l) {
  for (const [c, b] of S)
    if (b.canHandle(l)) {
      const [t, i] = b.serialize(l);
      return [
        {
          type: "HANDLER",
          name: c,
          value: t
        },
        i
      ];
    }
  return [
    {
      type: "RAW",
      value: l
    },
    K.get(l) || []
  ];
}
function u(l) {
  switch (l.type) {
    case "HANDLER":
      return S.get(l.name).deserialize(l.value);
    case "RAW":
      return l.value;
  }
}
function G(l, c, b) {
  return new Promise((t) => {
    const i = z();
    l.addEventListener("message", function e(m) {
      !m.data || !m.data.id || m.data.id !== i || (l.removeEventListener("message", e), t(m.data));
    }), l.start && l.start(), l.postMessage(Object.assign({ id: i }, c), b);
  });
}
function z() {
  return new Array(4).fill(0).map(() => Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(16)).join("-");
}
var C = "KGZ1bmN0aW9uKCl7InVzZSBzdHJpY3QiO2NvbnN0ICQ9U3ltYm9sKCJDb21saW5rLnByb3h5IiksQT1TeW1ib2woIkNvbWxpbmsuZW5kcG9pbnQiKSxSPVN5bWJvbCgiQ29tbGluay5yZWxlYXNlUHJveHkiKSx5PVN5bWJvbCgiQ29tbGluay50aHJvd24iKSxfPWU9PnR5cGVvZiBlPT0ib2JqZWN0IiYmZSE9PW51bGx8fHR5cGVvZiBlPT0iZnVuY3Rpb24iLEw9e2NhbkhhbmRsZTplPT5fKGUpJiZlWyRdLHNlcmlhbGl6ZShlKXtjb25zdHtwb3J0MTpyLHBvcnQyOml9PW5ldyBNZXNzYWdlQ2hhbm5lbDtyZXR1cm4gdyhlLHIpLFtpLFtpXV19LGRlc2VyaWFsaXplKGUpe3JldHVybiBlLnN0YXJ0KCksQyhlKX19LE89e2NhbkhhbmRsZTplPT5fKGUpJiZ5IGluIGUsc2VyaWFsaXplKHt2YWx1ZTplfSl7bGV0IHI7cmV0dXJuIGUgaW5zdGFuY2VvZiBFcnJvcj9yPXtpc0Vycm9yOiEwLHZhbHVlOnttZXNzYWdlOmUubWVzc2FnZSxuYW1lOmUubmFtZSxzdGFjazplLnN0YWNrfX06cj17aXNFcnJvcjohMSx2YWx1ZTplfSxbcixbXV19LGRlc2VyaWFsaXplKGUpe3Rocm93IGUuaXNFcnJvcj9PYmplY3QuYXNzaWduKG5ldyBFcnJvcihlLnZhbHVlLm1lc3NhZ2UpLGUudmFsdWUpOmUudmFsdWV9fSxFPW5ldyBNYXAoW1sicHJveHkiLExdLFsidGhyb3ciLE9dXSk7ZnVuY3Rpb24gdyhlLHI9c2VsZil7ci5hZGRFdmVudExpc3RlbmVyKCJtZXNzYWdlIixmdW5jdGlvbiBpKHMpe2lmKCFzfHwhcy5kYXRhKXJldHVybjtjb25zdHtpZDpvLHR5cGU6YSxwYXRoOm59PU9iamVjdC5hc3NpZ24oe3BhdGg6W119LHMuZGF0YSksYz0ocy5kYXRhLmFyZ3VtZW50TGlzdHx8W10pLm1hcChtKTtsZXQgbDt0cnl7Y29uc3QgdT1uLnNsaWNlKDAsLTEpLnJlZHVjZSgoZCxwKT0+ZFtwXSxlKSxmPW4ucmVkdWNlKChkLHApPT5kW3BdLGUpO3N3aXRjaChhKXtjYXNlIkdFVCI6bD1mO2JyZWFrO2Nhc2UiU0VUIjp1W24uc2xpY2UoLTEpWzBdXT1tKHMuZGF0YS52YWx1ZSksbD0hMDticmVhaztjYXNlIkFQUExZIjpsPWYuYXBwbHkodSxjKTticmVhaztjYXNlIkNPTlNUUlVDVCI6e2NvbnN0IGQ9bmV3IGYoLi4uYyk7bD16KGQpfWJyZWFrO2Nhc2UiRU5EUE9JTlQiOntjb25zdHtwb3J0MTpkLHBvcnQyOnB9PW5ldyBNZXNzYWdlQ2hhbm5lbDt3KGUscCksbD1OKGQsW2RdKX1icmVhaztjYXNlIlJFTEVBU0UiOmw9dm9pZCAwO2JyZWFrO2RlZmF1bHQ6cmV0dXJufX1jYXRjaCh1KXtsPXt2YWx1ZTp1LFt5XTowfX1Qcm9taXNlLnJlc29sdmUobCkuY2F0Y2godT0+KHt2YWx1ZTp1LFt5XTowfSkpLnRoZW4odT0+e2NvbnN0W2YsZF09Uyh1KTtyLnBvc3RNZXNzYWdlKE9iamVjdC5hc3NpZ24oT2JqZWN0LmFzc2lnbih7fSxmKSx7aWQ6b30pLGQpLGE9PT0iUkVMRUFTRSImJihyLnJlbW92ZUV2ZW50TGlzdGVuZXIoIm1lc3NhZ2UiLGkpLE0ocikpfSl9KSxyLnN0YXJ0JiZyLnN0YXJ0KCl9ZnVuY3Rpb24gVChlKXtyZXR1cm4gZS5jb25zdHJ1Y3Rvci5uYW1lPT09Ik1lc3NhZ2VQb3J0In1mdW5jdGlvbiBNKGUpe1QoZSkmJmUuY2xvc2UoKX1mdW5jdGlvbiBDKGUscil7cmV0dXJuIGIoZSxbXSxyKX1mdW5jdGlvbiBoKGUpe2lmKGUpdGhyb3cgbmV3IEVycm9yKCJQcm94eSBoYXMgYmVlbiByZWxlYXNlZCBhbmQgaXMgbm90IHVzZWFibGUiKX1mdW5jdGlvbiBiKGUscj1bXSxpPWZ1bmN0aW9uKCl7fSl7bGV0IHM9ITE7Y29uc3Qgbz1uZXcgUHJveHkoaSx7Z2V0KGEsbil7aWYoaChzKSxuPT09UilyZXR1cm4oKT0+ZyhlLHt0eXBlOiJSRUxFQVNFIixwYXRoOnIubWFwKGM9PmMudG9TdHJpbmcoKSl9KS50aGVuKCgpPT57TShlKSxzPSEwfSk7aWYobj09PSJ0aGVuIil7aWYoci5sZW5ndGg9PT0wKXJldHVybnt0aGVuOigpPT5vfTtjb25zdCBjPWcoZSx7dHlwZToiR0VUIixwYXRoOnIubWFwKGw9PmwudG9TdHJpbmcoKSl9KS50aGVuKG0pO3JldHVybiBjLnRoZW4uYmluZChjKX1yZXR1cm4gYihlLFsuLi5yLG5dKX0sc2V0KGEsbixjKXtoKHMpO2NvbnN0W2wsdV09UyhjKTtyZXR1cm4gZyhlLHt0eXBlOiJTRVQiLHBhdGg6Wy4uLnIsbl0ubWFwKGY9PmYudG9TdHJpbmcoKSksdmFsdWU6bH0sdSkudGhlbihtKX0sYXBwbHkoYSxuLGMpe2gocyk7Y29uc3QgbD1yW3IubGVuZ3RoLTFdO2lmKGw9PT1BKXJldHVybiBnKGUse3R5cGU6IkVORFBPSU5UIn0pLnRoZW4obSk7aWYobD09PSJiaW5kIilyZXR1cm4gYihlLHIuc2xpY2UoMCwtMSkpO2NvbnN0W3UsZl09RihjKTtyZXR1cm4gZyhlLHt0eXBlOiJBUFBMWSIscGF0aDpyLm1hcChkPT5kLnRvU3RyaW5nKCkpLGFyZ3VtZW50TGlzdDp1fSxmKS50aGVuKG0pfSxjb25zdHJ1Y3QoYSxuKXtoKHMpO2NvbnN0W2MsbF09RihuKTtyZXR1cm4gZyhlLHt0eXBlOiJDT05TVFJVQ1QiLHBhdGg6ci5tYXAodT0+dS50b1N0cmluZygpKSxhcmd1bWVudExpc3Q6Y30sbCkudGhlbihtKX19KTtyZXR1cm4gb31mdW5jdGlvbiBEKGUpe3JldHVybiBBcnJheS5wcm90b3R5cGUuY29uY2F0LmFwcGx5KFtdLGUpfWZ1bmN0aW9uIEYoZSl7Y29uc3Qgcj1lLm1hcChTKTtyZXR1cm5bci5tYXAoaT0+aVswXSksRChyLm1hcChpPT5pWzFdKSldfWNvbnN0IFA9bmV3IFdlYWtNYXA7ZnVuY3Rpb24gTihlLHIpe3JldHVybiBQLnNldChlLHIpLGV9ZnVuY3Rpb24geihlKXtyZXR1cm4gT2JqZWN0LmFzc2lnbihlLHtbJF06ITB9KX1mdW5jdGlvbiBTKGUpe2Zvcihjb25zdFtyLGldb2YgRSlpZihpLmNhbkhhbmRsZShlKSl7Y29uc3RbcyxvXT1pLnNlcmlhbGl6ZShlKTtyZXR1cm5be3R5cGU6IkhBTkRMRVIiLG5hbWU6cix2YWx1ZTpzfSxvXX1yZXR1cm5be3R5cGU6IlJBVyIsdmFsdWU6ZX0sUC5nZXQoZSl8fFtdXX1mdW5jdGlvbiBtKGUpe3N3aXRjaChlLnR5cGUpe2Nhc2UiSEFORExFUiI6cmV0dXJuIEUuZ2V0KGUubmFtZSkuZGVzZXJpYWxpemUoZS52YWx1ZSk7Y2FzZSJSQVciOnJldHVybiBlLnZhbHVlfX1mdW5jdGlvbiBnKGUscixpKXtyZXR1cm4gbmV3IFByb21pc2Uocz0+e2NvbnN0IG89VSgpO2UuYWRkRXZlbnRMaXN0ZW5lcigibWVzc2FnZSIsZnVuY3Rpb24gYShuKXshbi5kYXRhfHwhbi5kYXRhLmlkfHxuLmRhdGEuaWQhPT1vfHwoZS5yZW1vdmVFdmVudExpc3RlbmVyKCJtZXNzYWdlIixhKSxzKG4uZGF0YSkpfSksZS5zdGFydCYmZS5zdGFydCgpLGUucG9zdE1lc3NhZ2UoT2JqZWN0LmFzc2lnbih7aWQ6b30sciksaSl9KX1mdW5jdGlvbiBVKCl7cmV0dXJuIG5ldyBBcnJheSg0KS5maWxsKDApLm1hcCgoKT0+TWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpKk51bWJlci5NQVhfU0FGRV9JTlRFR0VSKS50b1N0cmluZygxNikpLmpvaW4oIi0iKX1jb25zdCBXPWFzeW5jKCk9PldlYkFzc2VtYmx5LnZhbGlkYXRlKG5ldyBVaW50OEFycmF5KFswLDk3LDExNSwxMDksMSwwLDAsMCwxLDUsMSw5NiwwLDEsMTIzLDMsMiwxLDAsMTAsMTAsMSw4LDAsNjUsMCwyNTMsMTUsMjUzLDk4LDExXSkpLGs9ImVhZ2VyIix4PSJsYXp5IixqPXtzc3c6WyJzaW1kIl0sbWluaW1hcDI6WyJzaW1kIl19LHQ9e3Rvb2xzOltdLGNvbmZpZzp7fSxmaWxlczpbXSxiYXNlOnt9LGZzOnt9LGFzeW5jIGluaXQoKXtpZih0LnRvb2xzLmxlbmd0aD09PTApdGhyb3ciRXhwZWN0aW5nIGF0IGxlYXN0IDEgdG9vbC4iO2lmKG5ldyBTZXQodC50b29scy5tYXAocj0+YCR7ci50b29sfS8ke3IucHJvZ3JhbXx8ci50b29sfWApKS5zaXplIT09dC50b29scy5sZW5ndGgpdGhyb3ciRm91bmQgZHVwbGljYXRlIHRvb2xzOyBjYW4gb25seSBoYXZlIGVhY2ggdG9vbC9wcm9ncmFtIGNvbWJpbmF0aW9uIGF0IG1vc3Qgb25jZS4iO2lmKHQuYmFzZT10LnRvb2xzLmZpbmQocj0+ci5yZWluaXQhPT0hMCksIXQuYmFzZSl0aHJvdyJDb3VsZCBub3QgZmluZCBhIHRvb2wgd2l0aCBgcmVpbml0OiBmYWxzZWAgdG8gdXNlIGFzIHRoZSBiYXNlIG1vZHVsZS4gVG8gZml4IHRoaXMgaXNzdWUsIGluY2x1ZGUgdGhlIHRvb2wgYGJhc2UvMS4wLjBgIHdoZW4gaW5pdGlhbGl6aW5nIEFpb2xpLiI7cmV0dXJuIHQuYmFzZS5pc0Jhc2VNb2R1bGU9ITAsYXdhaXQgdGhpcy5fc2V0dXAodC5iYXNlKSxhd2FpdCB0aGlzLl9pbml0TW9kdWxlcygpLHQuX2xvZygiUmVhZHkiKSwhMH0sYXN5bmMgX2luaXRNb2R1bGVzKCl7YXdhaXQgUHJvbWlzZS5hbGwodC50b29scy5tYXAodGhpcy5fc2V0dXApKSxhd2FpdCB0aGlzLl9zZXR1cEZTKCl9LG1vdW50KGU9W10pe2NvbnN0IHI9YCR7dC5jb25maWcuZGlyU2hhcmVkfSR7dC5jb25maWcuZGlyRGF0YX1gLGk9YCR7dC5jb25maWcuZGlyU2hhcmVkfSR7dC5jb25maWcuZGlyTW91bnRlZH1gO2xldCBzPVtdLG89W10sYT1bXTshQXJyYXkuaXNBcnJheShlKSYmIShlIGluc3RhbmNlb2YgRmlsZUxpc3QpJiYoZT1bZV0pLHQuX2xvZyhgTW91bnRpbmcgJHtlLmxlbmd0aH0gZmlsZXNgKTtmb3IobGV0IG4gb2YgZSl7aWYobiBpbnN0YW5jZW9mIEZpbGV8fChuPT1udWxsP3ZvaWQgMDpuLmRhdGEpaW5zdGFuY2VvZiBCbG9iJiZuLm5hbWV8fHR5cGVvZihuPT1udWxsP3ZvaWQgMDpuLmRhdGEpPT0ic3RyaW5nIiYmbi5uYW1lKXR5cGVvZihuPT1udWxsP3ZvaWQgMDpuLmRhdGEpPT0ic3RyaW5nIiYmKG4uZGF0YT1uZXcgQmxvYihbbi5kYXRhXSx7dHlwZToidGV4dC9wbGFpbiJ9KSkscy5wdXNoKG4pO2Vsc2UgaWYobi5uYW1lJiZuLnVybClvLnB1c2gobik7ZWxzZSBpZih0eXBlb2Ygbj09InN0cmluZyImJm4uc3RhcnRzV2l0aCgiaHR0cCIpKW49e3VybDpuLG5hbWU6bi5zcGxpdCgiLy8iKS5wb3AoKS5yZXBsYWNlKC9cLy9nLCItIil9LG8ucHVzaChuKTtlbHNlIHRocm93J0Nhbm5vdCBtb3VudCBmaWxlKHMpIHNwZWNpZmllZC4gTXVzdCBiZSBhIEZpbGUsIEJsb2IsIGEgVVJMIHN0cmluZywgb3IgeyBuYW1lOiAiZmlsZS50eHQiLCBkYXRhOiAic3RyaW5nIiB9Lic7YS5wdXNoKG4ubmFtZSl9dHJ5e3QuZnMudW5tb3VudChpKX1jYXRjaHt9Zm9yKGxldCBuIG9mIG8pdC5mcy5jcmVhdGVMYXp5RmlsZShyLG4ubmFtZSxuLnVybCwhMCwhMCk7cmV0dXJuIHQuZmlsZXM9dC5maWxlcy5jb25jYXQocyksdC5iYXNlLm1vZHVsZS5GUy5tb3VudCh0LmJhc2UubW9kdWxlLldPUktFUkZTLHtmaWxlczp0LmZpbGVzLmZpbHRlcihuPT5uIGluc3RhbmNlb2YgRmlsZSksYmxvYnM6dC5maWxlcy5maWx0ZXIobj0+KG49PW51bGw/dm9pZCAwOm4uZGF0YSlpbnN0YW5jZW9mIEJsb2IpfSxpKSxzLm1hcChuPT57Y29uc3QgYz1gJHtpfS8ke24ubmFtZX1gLGw9YCR7cn0vJHtuLm5hbWV9YDt0cnl7dC5mcy51bmxpbmsobCl9Y2F0Y2h7fXQuX2xvZyhgQ3JlYXRpbmcgc3ltbGluazogJHtsfSAtLT4gJHtjfWApLHQuZnMuc3ltbGluayhjLGwpfSksYS5tYXAobj0+YCR7cn0vJHtufWApfSxhc3luYyBleGVjKGUscj1udWxsKXtpZih0Ll9sb2coYEV4ZWN1dGluZyAlYyR7ZX0lYyBhcmdzPSR7cn1gLCJjb2xvcjpkYXJrYmx1ZTsgZm9udC13ZWlnaHQ6Ym9sZCIsIiIpLCFlKXRocm93IkV4cGVjdGluZyBhIGNvbW1hbmQiO2xldCBpPWU7cj09bnVsbCYmKHI9ZS5zcGxpdCgiICIpLGk9ci5zaGlmdCgpKTtjb25zdCBzPXQudG9vbHMuZmluZChhPT57dmFyIGM7bGV0IG49aTtyZXR1cm4oKGM9YT09bnVsbD92b2lkIDA6YS5mZWF0dXJlcyk9PW51bGw/dm9pZCAwOmMuc2ltZCk9PT0hMCYmKG49YCR7bn0tc2ltZGApLGEucHJvZ3JhbT09bn0pO2lmKHM9PW51bGwpdGhyb3dgUHJvZ3JhbSAke2l9IG5vdCBmb3VuZC5gO3Muc3Rkb3V0PSIiLHMuc3RkZXJyPSIiLHMubG9hZGluZz09eCYmKHMubG9hZGluZz1rLGF3YWl0IHRoaXMuX2luaXRNb2R1bGVzKCkpO3RyeXtzLm1vZHVsZS5jYWxsTWFpbihyKX1jYXRjaChhKXtjb25zb2xlLmVycm9yKGEpfXRyeXtzLm1vZHVsZS5GUy5jbG9zZShzLm1vZHVsZS5GUy5zdHJlYW1zWzFdKSxzLm1vZHVsZS5GUy5jbG9zZShzLm1vZHVsZS5GUy5zdHJlYW1zWzJdKX1jYXRjaHt9cy5tb2R1bGUuRlMuc3RyZWFtc1sxXT1zLm1vZHVsZS5GUy5vcGVuKCIvZGV2L3N0ZG91dCIsInciKSxzLm1vZHVsZS5GUy5zdHJlYW1zWzJdPXMubW9kdWxlLkZTLm9wZW4oIi9kZXYvc3RkZXJyIiwidyIpO2xldCBvPXtzdGRvdXQ6cy5zdGRvdXQsc3RkZXJyOnMuc3RkZXJyfTtyZXR1cm4gdC5jb25maWcucHJpbnRJbnRlcmxlYXZlZCYmKG89cy5zdGRvdXQpLHMucmVpbml0PT09ITAmJmF3YWl0IHRoaXMucmVpbml0KHMudG9vbCksb30sY2F0KGUpe3JldHVybiB0Ll9maWxlb3AoImNhdCIsZSl9LGxzKGUpe3JldHVybiB0Ll9maWxlb3AoImxzIixlKX0sZG93bmxvYWQoZSl7cmV0dXJuIHQuX2ZpbGVvcCgiZG93bmxvYWQiLGUpfSxwd2QoKXtyZXR1cm4gdC5mcy5jd2QoKX0sY2QoZSl7Zm9yKGxldCByIG9mIHQudG9vbHMpIXIubW9kdWxlfHxyLm1vZHVsZS5GUy5jaGRpcihlKX0sbWtkaXIoZSl7cmV0dXJuIHQuZnMubWtkaXIoZSksITB9LHJlYWQoe3BhdGg6ZSxsZW5ndGg6cixmbGFnOmk9InIiLG9mZnNldDpzPTAscG9zaXRpb246bz0wfSl7Y29uc3QgYT10LmZzLm9wZW4oZSxpKSxuPW5ldyBVaW50OEFycmF5KHIpO3JldHVybiB0LmZzLnJlYWQoYSxuLHMscixvKSx0LmZzLmNsb3NlKGEpLG59LHdyaXRlKHtwYXRoOmUsYnVmZmVyOnIsZmxhZzppPSJ3KyIsb2Zmc2V0OnM9MCxwb3NpdGlvbjpvPTB9KXtjb25zdCBhPXQuZnMub3BlbihlLGkpO3QuZnMud3JpdGUoYSxyLHMsci5sZW5ndGgsbyksdC5mcy5jbG9zZShhKX0sYXN5bmMgcmVpbml0KGUpe2NvbnN0IHI9dC50b29scy5maW5kKHM9PnMudG9vbD09ZSksaT10LmJhc2UubW9kdWxlLkZTLmN3ZCgpO09iamVjdC5hc3NpZ24ocixyLmNvbmZpZyksci5yZWFkeT0hMSxhd2FpdCB0aGlzLmluaXQoKSxyLmlzQmFzZU1vZHVsZSYmdGhpcy5tb3VudCgpLHRoaXMuY2QoaSl9LF9zdGRpblR4dDoiIixfc3RkaW5QdHI6MCxnZXQgc3RkaW4oKXtyZXR1cm4gdC5fc3RkaW5UeHR9LHNldCBzdGRpbihlPSIiKXt0Ll9sb2coYFNldHRpbmcgc3RkaW4gdG8gJWMke2V9JWNgLCJjb2xvcjpkYXJrYmx1ZSIsIiIpLHQuX3N0ZGluVHh0PWUsdC5fc3RkaW5QdHI9MH0sYXN5bmMgX3NldHVwKGUpe2lmKGUucmVhZHkpcmV0dXJuO2lmKHQuX2xvZyhgU2V0dGluZyB1cCAke2UudG9vbH0gKGJhc2UgPSAke2UuaXNCYXNlTW9kdWxlPT09ITB9KS4uLmApLGUuY29uZmlnPU9iamVjdC5hc3NpZ24oe30sZSksZS51cmxQcmVmaXh8fChlLnVybFByZWZpeD1gJHt0LmNvbmZpZy51cmxDRE59LyR7ZS50b29sfS8ke2UudmVyc2lvbn1gKSxlLnByb2dyYW18fChlLnByb2dyYW09ZS50b29sKSxlLmZlYXR1cmVzfHwoZS5mZWF0dXJlcz17fSwoaltlLnByb2dyYW1dfHxbXSkuaW5jbHVkZXMoInNpbWQiKSYmKGF3YWl0IFcoKT8oZS5wcm9ncmFtKz0iLXNpbWQiLGUuZmVhdHVyZXMuc2ltZD0hMCk6dC5fbG9nKGBXZWJBc3NlbWJseSBTSU1EIGlzIG5vdCBzdXBwb3J0ZWQgaW4gdGhpcyBicm93c2VyOyB3aWxsIGxvYWQgbm9uLVNJTUQgdmVyc2lvbiBvZiAke2UucHJvZ3JhbX0uYCkpKSxlLmlzQmFzZU1vZHVsZSYmKGUubG9hZGluZz1rKSxlLmxvYWRpbmc9PT14KXt0Ll9sb2coYFdpbGwgbGF6eS1sb2FkICR7ZS50b29sfTsgc2tpcHBpbmcgaW5pdGlhbGl6YXRpb24uYCk7cmV0dXJufXNlbGYuaW1wb3J0U2NyaXB0cyhgJHtlLnVybFByZWZpeH0vJHtlLnByb2dyYW19LmpzYCksZS5tb2R1bGU9YXdhaXQgTW9kdWxlKHt0aGlzUHJvZ3JhbTplLnByb2dyYW0sbG9jYXRlRmlsZTooaSxzKT0+YCR7ZS51cmxQcmVmaXh9LyR7aX1gLHN0ZGluOigpPT50Ll9zdGRpblB0cjx0LnN0ZGluLmxlbmd0aD90LnN0ZGluLmNoYXJDb2RlQXQodC5fc3RkaW5QdHIrKyk6KHQuc3RkaW49IiIsbnVsbCkscHJpbnQ6aT0+e3QuY29uZmlnLnByaW50U3RyZWFtP3Bvc3RNZXNzYWdlKHt0eXBlOiJiaW93YXNtIix2YWx1ZTp7c3Rkb3V0Oml9fSk6ZS5zdGRvdXQrPWkrYApgfSxwcmludEVycjppPT57Y29uc3Qgcz10LmNvbmZpZy5wcmludEludGVybGVhdmVkPyJzdGRvdXQiOiJzdGRlcnIiO3QuY29uZmlnLnByaW50U3RyZWFtP3Bvc3RNZXNzYWdlKHt0eXBlOiJiaW93YXNtIix2YWx1ZTp7W3NdOml9fSk6ZVtzXSs9aStgCmB9fSk7Y29uc3Qgcj1lLm1vZHVsZS5GUztlLmlzQmFzZU1vZHVsZT8odC5fbG9nKGBTZXR0aW5nIHVwICR7ZS50b29sfSB3aXRoIGJhc2UgbW9kdWxlIGZpbGVzeXN0ZW0uLi5gKSxyLm1rZGlyKHQuY29uZmlnLmRpclNoYXJlZCw1MTEpLHIubWtkaXIoYCR7dC5jb25maWcuZGlyU2hhcmVkfS8ke3QuY29uZmlnLmRpckRhdGF9YCw1MTEpLHIubWtkaXIoYCR7dC5jb25maWcuZGlyU2hhcmVkfS8ke3QuY29uZmlnLmRpck1vdW50ZWR9YCw1MTEpLHIuY2hkaXIoYCR7dC5jb25maWcuZGlyU2hhcmVkfS8ke3QuY29uZmlnLmRpckRhdGF9YCksdC5mcz1yKToodC5fbG9nKGBTZXR0aW5nIHVwICR7ZS50b29sfSB3aXRoIGZpbGVzeXN0ZW0uLi5gKSxyLm1rZGlyKHQuY29uZmlnLmRpclNoYXJlZCksci5tb3VudChlLm1vZHVsZS5QUk9YWUZTLHtyb290OnQuY29uZmlnLmRpclNoYXJlZCxmczp0LmZzfSx0LmNvbmZpZy5kaXJTaGFyZWQpLHIuY2hkaXIodC5mcy5jd2QoKSkpLGUuc3Rkb3V0PSIiLGUuc3RkZXJyPSIiLGUucmVhZHk9ITB9LGFzeW5jIF9zZXR1cEZTKCl7Y29uc3QgZT10LmZzO2ZvcihsZXQgciBvZiB0LnRvb2xzKXtpZighci5yZWFkeSljb250aW51ZTtjb25zdCBpPXIubW9kdWxlLkZTLHM9YC8ke3IudG9vbH1gLG89YCR7dC5jb25maWcuZGlyU2hhcmVkfSR7c31gOyFpLmFuYWx5emVQYXRoKHMpLmV4aXN0c3x8ZS5hbmFseXplUGF0aChvKS5leGlzdHN8fCh0Ll9sb2coYE1vdW50aW5nICR7c30gb250byAke3QuYmFzZS50b29sfSBmaWxlc3lzdGVtIGF0ICR7b31gKSxlLm1rZGlyKG8pLGUubW91bnQodC5iYXNlLm1vZHVsZS5QUk9YWUZTLHtyb290OnMsZnM6aX0sbykpfX0sX2ZpbGVvcChlLHIpe3QuX2xvZyhgUnVubmluZyAke2V9ICR7cn1gKTtjb25zdCBpPXQuZnMuYW5hbHl6ZVBhdGgocik7aWYoIWkuZXhpc3RzKXJldHVybiB0Ll9sb2coYEZpbGUgJHtyfSBub3QgZm91bmQuYCksITE7c3dpdGNoKGUpe2Nhc2UiY2F0IjpyZXR1cm4gdC5mcy5yZWFkRmlsZShyLHtlbmNvZGluZzoidXRmOCJ9KTtjYXNlImxzIjpyZXR1cm4gdC5mcy5pc0ZpbGUoaS5vYmplY3QubW9kZSk/dC5mcy5zdGF0KHIpOnQuZnMucmVhZGRpcihyKTtjYXNlImRvd25sb2FkIjpjb25zdCBzPW5ldyBCbG9iKFt0aGlzLmNhdChyKV0pO3JldHVybiBVUkwuY3JlYXRlT2JqZWN0VVJMKHMpfXJldHVybiExfSxfbG9nKGUpe2lmKCF0LmNvbmZpZy5kZWJ1ZylyZXR1cm47bGV0IHI9Wy4uLmFyZ3VtZW50c107ci5zaGlmdCgpLGNvbnNvbGUubG9nKGAlY1tXZWJXb3JrZXJdJWMgJHtlfWAsImZvbnQtd2VpZ2h0OmJvbGQiLCIiLC4uLnIpfX07dyh0KX0pKCk7Cg==";
var L = typeof window < "u" && window.Blob && new Blob([atob(C)], { type: "text/javascript;charset=utf-8" });
function v() {
  const l = L && (window.URL || window.webkitURL).createObjectURL(L);
  try {
    return l ? new Worker(l) : new Worker("data:application/javascript;base64," + C);
  } finally {
    l && (window.URL || window.webkitURL).revokeObjectURL(l);
  }
}
var f = "https://biowasm.com/cdn/v3";
var F = "https://stg.biowasm.com/cdn/v3";
var B = {
  urlCDN: f,
  urlCDNStg: F,
  dirShared: "/shared",
  dirMounted: "/mnt",
  dirData: "/data",
  printInterleaved: true,
  printStream: false,
  callback: null,
  debug: false,
  env: "prd"
};
var Q = class {
  constructor(c, b = {}) {
    if (c == null)
      throw "Expecting array of tools as input to Aioli constructor.";
    return Array.isArray(c) || (c = [c]), b = Object.assign({}, B, b), c = c.map(this._parseTool), b.env === "stg" && (b.urlCDN = b.urlCDNStg), this.tools = c, this.config = b, this.config.callback != null && (this.callback = this.config.callback), delete this.config.callback, this.init();
  }
  async init() {
    const c = new v();
    this.callback && (c.onmessage = (t) => {
      t.data.type === "biowasm" && this.callback(t.data.value);
    });
    const b = I(c);
    return b.tools = this.tools, b.config = this.config, await b.init(), b;
  }
  _parseTool(c) {
    if (typeof c != "string")
      return c;
    const b = c.split("/");
    if (b.length != 2 && b.length != 3)
      throw "Expecting '<tool>/<version>' or '<tool>/<program>/<version>'";
    return {
      tool: b[0],
      program: b.length == 3 ? b[1] : b[0],
      version: b[b.length - 1]
    };
  }
};

// src/runner.js
var COMMAND_REGISTRY = {
  "astral": { tool: "ASTER", version: "1.23", program: "astral" },
  "astral-pro": { tool: "ASTER", version: "1.23", program: "astral-pro" },
  "wastral": { tool: "ASTER", version: "1.23", program: "wastral" },
  "caster-site": { tool: "ASTER", version: "1.23", program: "caster-site" },
  "caster-pair": { tool: "ASTER", version: "1.23", program: "caster-pair" },
  "bcftools": { tool: "bcftools", version: "1.10", program: "bcftools" },
  "bedtools": { tool: "bedtools", version: "2.31.0", program: "bedtools" },
  "bhtsne": { tool: "bhtsne", version: "2016.08.22", program: "bhtsne" },
  "bowtie2-align-s": { tool: "bowtie2", version: "2.4.2", program: "bowtie2-align-s" },
  "cawlign": { tool: "cawlign", version: "0.1.0", program: "cawlign" },
  "basename": { tool: "coreutils", version: "8.32", program: "basename" },
  "cat": { tool: "coreutils", version: "8.32", program: "cat" },
  "comm": { tool: "coreutils", version: "8.32", program: "comm" },
  "cut": { tool: "coreutils", version: "8.32", program: "cut" },
  "date": { tool: "coreutils", version: "8.32", program: "date" },
  "df": { tool: "coreutils", version: "8.32", program: "df" },
  "dirname": { tool: "coreutils", version: "8.32", program: "dirname" },
  "du": { tool: "coreutils", version: "8.32", program: "du" },
  "echo": { tool: "coreutils", version: "8.32", program: "echo" },
  "env": { tool: "coreutils", version: "8.32", program: "env" },
  "fold": { tool: "coreutils", version: "8.32", program: "fold" },
  "head": { tool: "coreutils", version: "8.32", program: "head" },
  "join": { tool: "coreutils", version: "8.32", program: "join" },
  "ls": { tool: "coreutils", version: "8.32", program: "ls" },
  "md5sum": { tool: "coreutils", version: "8.32", program: "md5sum" },
  "paste": { tool: "coreutils", version: "8.32", program: "paste" },
  "seq": { tool: "coreutils", version: "8.32", program: "seq" },
  "shuf": { tool: "coreutils", version: "8.32", program: "shuf" },
  "sort": { tool: "coreutils", version: "8.32", program: "sort" },
  "tail": { tool: "coreutils", version: "8.32", program: "tail" },
  "tee": { tool: "coreutils", version: "8.32", program: "tee" },
  "tr": { tool: "coreutils", version: "8.32", program: "tr" },
  "uniq": { tool: "coreutils", version: "8.32", program: "uniq" },
  "wc": { tool: "coreutils", version: "8.32", program: "wc" },
  "fastp": { tool: "fastp", version: "0.20.1", program: "fastp" },
  "find": { tool: "findutils", version: "4.9.0", program: "find" },
  "fasttree": { tool: "fasttree", version: "2.1.11", program: "fasttree" },
  "gawk": { tool: "gawk", version: "5.1.0", program: "gawk" },
  "gfatools": { tool: "gfatools", version: "253", program: "gfatools" },
  "gffread": { tool: "gffread", version: "0.12.7", program: "gffread" },
  "grep": { tool: "grep", version: "3.7", program: "grep" },
  "tabix": { tool: "htslib", version: "1.21", program: "tabix" },
  "htsfile": { tool: "htslib", version: "1.21", program: "htsfile" },
  "bgzip": { tool: "htslib", version: "1.21", program: "bgzip" },
  "hyphy": { tool: "hyphy", version: "2.5.57", program: "hyphy" },
  "ivar": { tool: "ivar", version: "1.3.1", program: "ivar" },
  "jq": { tool: "jq", version: "1.7", program: "jq" },
  "kalign": { tool: "kalign", version: "3.3.1", program: "kalign" },
  "bigBedToBed": { tool: "kentutils", version: "437", program: "bigBedToBed" },
  "bigBedInfo": { tool: "kentutils", version: "437", program: "bigBedInfo" },
  "bigWigToWig": { tool: "kentutils", version: "437", program: "bigWigToWig" },
  "bigWigInfo": { tool: "kentutils", version: "437", program: "bigWigInfo" },
  "lastz": { tool: "lastz", version: "1.04.52", program: "lastz" },
  "lastz_D": { tool: "lastz", version: "1.04.52", program: "lastz_D" },
  "bsdunzip": { tool: "libarchive", version: "3.7.2", program: "bsdunzip" },
  "lsd2": { tool: "lsd2", version: "2.3", program: "lsd2" },
  "tbfast": { tool: "mafft", version: "7.520", program: "tbfast" },
  "dvtditr": { tool: "mafft", version: "7.520", program: "dvtditr" },
  "minimap2": { tool: "minimap2", version: "2.22", program: "minimap2" },
  "minimap2-simd": { tool: "minimap2", version: "2.22", program: "minimap2-simd" },
  "modbam2bed": { tool: "modbam2bed", version: "0.9.5", program: "modbam2bed" },
  "nucmer": { tool: "mummer4", version: "4.0.0rc1", program: "nucmer" },
  "muscle": { tool: "muscle", version: "5.1.0", program: "muscle" },
  "samtools": { tool: "samtools", version: "1.21", program: "samtools" },
  "sed": { tool: "sed", version: "4.8", program: "sed", reinit: true },
  "lcs": { tool: "seq-align", version: "2017.10.18", program: "lcs" },
  "needleman_wunsch": { tool: "seq-align", version: "2017.10.18", program: "needleman_wunsch" },
  "smith_waterman": { tool: "seq-align", version: "2017.10.18", program: "smith_waterman" },
  "seqtk": { tool: "seqtk", version: "1.4", program: "seqtk" },
  "ssw": { tool: "ssw", version: "1.2.4", program: "ssw" },
  "ssw-simd": { tool: "ssw", version: "1.2.4", program: "ssw-simd" },
  "tn93": { tool: "tn93", version: "1.0.11", program: "tn93" },
  "tree": { tool: "tree", version: "2.0.4", program: "tree" },
  "vidjil-algo": { tool: "vidjil-algo", version: "2025.12", program: "vidjil-algo" },
  "viral_consensus": { tool: "ViralConsensus", version: "1.0.0", program: "viral_consensus" },
  "wgsim": { tool: "wgsim", version: "2011.10.17", program: "wgsim" }
};
var NEEDS_REINIT = /* @__PURE__ */ new Set(["sed"]);
var AIOLI_BASE_PROGRAM = "cat";
var IGNORED_RUNTIME_STDERR_LINES = /* @__PURE__ */ new Set([
  "warning: unsupported syscall: __sys_prlimit64"
]);
var commandFilterSet = null;
var runQueue = Promise.resolve();
var hasRun = false;
var configured = false;
function configure({ commands } = {}) {
  if (hasRun) {
    throw new Error("configure() must be called before the first runUnix() call");
  }
  if (commands !== void 0) {
    for (const cmd of commands) {
      if (!COMMAND_REGISTRY[cmd]) {
        throw new Error(`Unknown command: ${cmd}`);
      }
    }
    commandFilterSet = new Set(commands);
  }
  configured = true;
}
async function runUnix(command, stdin = "") {
  const stages = parsePipeline(command);
  for (const stage of stages) {
    const programName = stage[0];
    if (commandFilterSet && !commandFilterSet.has(programName)) {
      throw new Error(`Command not available: ${programName}`);
    }
    if (!COMMAND_REGISTRY[programName]) {
      throw new Error(`Unknown command: ${programName}`);
    }
  }
  const runPromise = runQueue.then(() => execPipeline(stages, stdin));
  runQueue = runPromise.catch(() => {
  });
  hasRun = true;
  return runPromise;
}
async function execPipeline(stages, stdin) {
  let input = String(stdin);
  let last = { stdout: input, stderr: "" };
  for (const [programName, ...args] of stages) {
    const cli = await initAioli(programName);
    cli.stdin = input;
    const raw = await cli.exec(programName, args.length > 0 ? args : null);
    const result = typeof raw === "string" ? { stdout: raw, stderr: "" } : { stdout: raw.stdout || "", stderr: sanitizeStderr(raw.stderr || "") };
    last = result;
    input = result.stdout;
  }
  return last;
}
async function initAioli(programName) {
  const entries = getAioliEntries(programName);
  const toolConfigs = entries.map((entry) => {
    const cfg = {
      tool: entry.tool,
      version: entry.version,
      program: entry.program,
      loading: "lazy"
    };
    if (NEEDS_REINIT.has(entry.program)) {
      cfg.reinit = true;
    }
    return cfg;
  });
  return new Q(toolConfigs, { printInterleaved: false });
}
function getAioliEntries(programName = null) {
  const requestedPrograms = programName ? [programName] : commandFilterSet ? [...commandFilterSet] : Object.keys(COMMAND_REGISTRY);
  const programs = [AIOLI_BASE_PROGRAM, ...requestedPrograms];
  return [...new Set(programs)].map((program) => COMMAND_REGISTRY[program]);
}
function parsePipeline(command) {
  if (typeof command !== "string") {
    throw new TypeError("command must be a string");
  }
  const tokens = tokenize(command);
  if (tokens.length === 0) {
    throw new Error("command is empty");
  }
  const stages = [];
  let current = [];
  for (const token of tokens) {
    if (token === "|") {
      if (current.length === 0) {
        throw new Error("pipeline contains an empty command");
      }
      stages.push(current);
      current = [];
      continue;
    }
    current.push(token);
  }
  if (current.length === 0) {
    throw new Error("pipeline cannot end with |");
  }
  stages.push(current);
  return stages;
}
function tokenize(command) {
  const tokens = [];
  let token = "";
  let quote = null;
  for (let i = 0; i < command.length; i += 1) {
    const ch = command[i];
    if (quote) {
      if (ch === quote) {
        quote = null;
      } else {
        token += ch;
      }
      continue;
    }
    if (ch === "'" || ch === '"') {
      quote = ch;
      continue;
    }
    if (/\s/.test(ch)) {
      if (token.length > 0) {
        tokens.push(token);
        token = "";
      }
      continue;
    }
    if (ch === "|") {
      if (token.length > 0) {
        tokens.push(token);
        token = "";
      }
      tokens.push("|");
      continue;
    }
    if (isUnsupportedShellChar(ch)) {
      throw new Error(`unsupported shell syntax: ${ch}`);
    }
    token += ch;
  }
  if (quote) {
    throw new Error(`unterminated ${quote} quote`);
  }
  if (token.length > 0) {
    tokens.push(token);
  }
  return tokens;
}
function isUnsupportedShellChar(ch) {
  return ch === ">" || ch === "<" || ch === ";" || ch === "&" || ch === "$" || ch === "*" || ch === "~" || ch === "`";
}
function sanitizeStderr(stderr) {
  if (!stderr) {
    return "";
  }
  return stderr.split("\n").filter((line) => !IGNORED_RUNTIME_STDERR_LINES.has(line.trim())).join("\n");
}
var __testing = { parsePipeline, tokenize, COMMAND_REGISTRY, getAioliEntries, sanitizeStderr };
export {
  __testing,
  configure,
  runUnix
};
